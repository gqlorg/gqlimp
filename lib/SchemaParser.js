const fs = require('fs');
const getFetch = require('gql-fetch').default;
const chalk = require('chalk');
const pgkjson = require('../package');

const gqlClasses = fs.readFileSync(__dirname + '/code/gql_base_classes.ts');
const readSchemaQuery = fs.readFileSync(__dirname +
    '/code/read_schema.graphql');

const scalarMapping = {
  String: 'string',
  Int: 'number',
  Float: 'number',
  Boolean: 'boolean',
  Date: 'string'
};

const ignoredProperties =
    ['__DirectiveLocation', '__Directive', '__EnumValue', '__InputValue',
      '__Field', '__TypeKind', '__Type', '__Schema'];


class SchemaParser {

  constructor(options) {
    this._options = options;
    this._fileName = options.fileName;
    this._response = null;
    this._outputPath = options.output;
    this.enums = {};
    this.interfaces = {};
    this.args = {};
    this.argsClasses = {};
    this.customScalars = {};
  }

  get fileName() {
    return this._fileName;
  }

  set fileName(value) {
    this._fileName = value;
  }

  generate() {
    this._response = null;
    return getFetch(this._options.url)(readSchemaQuery)
        .then((response) => {
          /*istanbul ignore next*/
          if (response.status !== 200) {
            console.error(chalk['red'](JSON.stringify(response.json)));
          } else {
            this._response = response.json['data']['__schema']['types'];
            if (this._options['verbose'])
              console.log(this._response);
            if (this._options['generate']) {
              try {
                if (this._outputPath) {
                  try {
                    fs.statSync(this._outputPath);
                  } catch (e) {
                    /*istanbul ignore next*/
                    fs.mkdirSync(this._outputPath);
                  }
                }
                fs.writeFileSync(this._outputPath + '/' +
                    this.fileName + '.ts', this._generate(), 'utf8');
              } catch (err) {
                /*istanbul ignore next*/
                console.error(chalk['red'](err.toString()));
              }
            }
          }
        })
        .catch(error => {
          /*istanbul ignore next*/
          if (process.env.NODE_ENV !== 'test')
            console.error(chalk['red'](error.toString()));
        });
  }

  _generate() {
    this._beforePrepareContent();
    let str = '';
    str += `/**********************
    * Generated with gqlimp v${pgkjson.version}
    * Creation Time: ${new Date()}
**********************/`;

    // Generate Helper Class
    str += '\n\n' + '/** \n\tHelper Class Declaration \n*/\n';
    str += gqlClasses;

    // Generate Custom Scalars
    str += '\n\n' + '/** \n\tCustom Scalars Declaration \n*/\n';
    for (const k of Object.keys(this.customScalars)) {
      str += 'export type ' + k + ' = ' + this.customScalars[k] + ';\n\n';
    }

    //Generate Enum
    str += '\n\n' + '/** \n\tEnum Declaration \n*/\n';
    for (const i of Object.keys(this.enums)) {
      str += 'export enum ' + i + ' {\n';
      let a = 0;
      for (const j of Object.keys(this.enums[i])) {
        str += '\t' + j + ' = \'' + this.enums[i][j] + '\'';
        if (a < Object.keys(this.enums[i]).length - 1) {
          str += ',';
        }
        str += '\n';
        a++;
      }
      str += '}\n\n';
    }

    //Generate Args
    str += '\n\n' + '/** \n\tArguments Declaration \n*/\n';
    for (const k of Object.keys(this.args)) {
      str += 'export interface ' + k + '_args {\n';
      for (const j of Object.keys(this.args[k])) {
        let type = this.args[k][j].type;
        const nonNull = (type.indexOf('!') > -1 ? '' : '?');
        const list = (type.indexOf('[]') > -1 ? '[]' : '');
        type = type.replace('!', '').replace('[]', '');
        if (scalarMapping[type]) {
          type = scalarMapping[type];
        } else if (this.args[type]) {
          type += '_args';
        }
        type += list;
        str +=
            '\t' + j + nonNull + ' : ' + type + ';\n';
      }
      str += '}\n\n';
    }

    // Generate Interface
    str += '\n\n' + '/** \n\tFields Declaration \n*/\n';
    for (const k of Object.keys(this.interfaces)) {
      let cStr = '';
      str += 'export interface ' + k + '_intf {\n';
      for (const j of Object.keys(this.interfaces[k])) {
        let type = this.interfaces[k][j].type;
        const nonNull = (type.indexOf('!') > -1 ? '' : '?');
        type = type.replace('!', '').replace('[]', '');
        let ftype = type;

        if (scalarMapping[type]) {
          type = scalarMapping[type];
          ftype = 'boolean | number';
          if (this.interfaces[k][j].args) {
            ftype = k + '_' + j;
            cStr += this._prepareWithoutFieldsArgClass(ftype, type);
          }
        } else if (this.customScalars[type]) {
          ftype = 'boolean | number';
        } else if (this.enums[type]) {
          ftype = 'boolean | number';
        }/*istanbul ignore next*/
        else if (this.interfaces[type]) {
          type += '_intf';
          ftype = k + '_' + j;
          if (this.interfaces[k][j].args) {
            cStr += this._prepareWithArgClass(ftype, type);
          } else {
            cStr += 'export class ' + ftype +
                ' extends GQLClass<' + type +
                '>{\n';
            cStr +=
                '\n\tconstructor(fields : ' + type + ') {\n' +
                '\t\tsuper(fields); \n';
            cStr += '\t}\n';
            cStr += '}\n\n\n';
          }
        }
        str += '\t' + j + nonNull + ' : ' + ftype + ';\n';
      }
      str += '}\n\n';
      str += cStr;
    }

    // Generate QueryObject
    //str += '\n\n' + '/** \n\tQueryObject Declaration \n*/\n';
    //str += constants.queryObject;

    return str;
  }

  _baseAdd(obj, ref) {
    if (obj.name && !ref[obj.name]) {
      const fields = obj['fields'] || obj['inputFields'];
      ref[obj.name] = {};
      for (const i of Object.keys(fields)) {
        const field = fields[i];
        let type = field.type;
        let list = '';
        let nonNull = '';
        if (['NON_NULL', 'LIST'].indexOf(type.kind) > -1) {
          if (type.kind === 'NON_NULL') {
            nonNull = '!';
          }
          if (type.kind === 'LIST') {
            list = '[]';
          }
          /*istanbul ignore next*/
          if (type['ofType'] && type['ofType'].name) {
            type = type['ofType'];
          } else if (type['ofType'] && type['ofType']['ofType'] &&
              type['ofType']['ofType'].name) {
            type = type['ofType']['ofType'];
          }
        }
        ref[obj.name][field.name] = ref[obj.name][field.name] || {};
        ref[obj.name][field.name].type = type.name + list + nonNull;
        if (field.args && field.args.length > 0) {
          ref[obj.name][field.name].args = field.args;
        }
        if (type.kind === 'SCALAR' && !scalarMapping[type.name]) {
          this.customScalars[type.name] = 'string';
        }
      }
    }
  }

  _prepareWithoutFieldsArgClass(className) {
    let str = '';
    str += 'export class ' + className +
        ' extends GQLWithoutFieldsArgsClass<' + className + '_args' + '>{\n';
    const args = this.args[className];
    str +=
        '\n\tconstructor(args : ' + className + '_args ) {\n' +
        '\t\tsuper(args); \n' +
        '\t\tthis.types = {\n';
    let cField = '';
    for (const q of Object.keys(args)) {
      if (cField !== '') {
        cField += ',\n';
      }
      cField += '\t\t\t' + q + ' : \'' + args[q].type + '\'';
    }
    str += cField;
    str += '\n\t\t}; \n';
    str += '\n\t}; \n';
    str += '}\n\n\n';
    return str;
  }

  _prepareWithArgClass(className, typeName) {
    let str = '';
    str += 'export class ' + className +
        ' extends GQLArgsClass<' + className + '_args,' +
        typeName +
        '>{\n';
    const args = this.args[className];
    str +=
        '\n\tconstructor(args : ' + className + '_args' +
        ', fields : ' + typeName + ') {\n' +
        '\t\tsuper(args, fields); \n' +
        '\t\tthis.types = {\n';
    let cField = '';
    for (const q of Object.keys(args)) {
      if (cField !== '') cField += ',\n';
      cField += '\t\t\t' + q + ' : \'' + args[q].type + '\'';
    }
    str += cField;
    str += '\n\t\t}; \n';
    str += '\n\t}; \n';
    str += '}\n\n\n';
    return str;
  }

  _addArgs(obj) {
    this._baseAdd(obj, this.args);
  }

  _addInterface(obj) {
    this._baseAdd(obj, this.interfaces);
    if (obj.fields) {
      for (const i of Object.keys(obj.fields)) {
        const field = obj.fields[i];
        if (field.args && field.args.length > 0) {
          this.argsClasses[obj.name] = field.args;
          const tmpObj = {
            kind: 'INPUT_OBJECT',
            name: obj.name + '_' + field.name,
            inputFields: field.args
          };
          this._baseAdd(tmpObj, this.args);
        }
      }
    }
  }

  _addEnum(obj) {
    if (!this.enums[obj.name]) {
      this.enums[obj.name] = {};
      for (const i of Object.keys(obj['enumValues'])) {
        const enm = obj['enumValues'][i];
        this.enums[obj.name][enm.name] = enm.name;
      }
    }
  }

  _beforePrepareContent() {
    for (const i of Object.keys(this._response)) {
      if (ignoredProperties.includes(this._response[i].name)) {
        continue;
      }
      if (this._response[i].kind === 'OBJECT') {
        this._addInterface(this._response[i]);
      } else if (this._response[i].kind === 'ENUM') {
        this._addEnum(this._response[i]);
      } else if (this._response[i].kind === 'INPUT_OBJECT') {
        this._addArgs(this._response[i]);
      }
    }

  }


}

module.exports = {
  SchemaParser: SchemaParser
};
