const fs = require('fs');
const pgkjson = require('../package');
const ReadSchema = require('./ReadSchema').ReadSchema;
const {scalarMapping} = require('./constants');

const gqlClasses = fs.readFileSync(__dirname + '/code/gql_base_classes.ts');
const interfaceRootObject = `\n\nexport class QueryObject extends GQLBaseObject< Query_intf > {
    get queryType(): string {
        return 'query';
    }
}

export class MutationObject extends GQLBaseObject< Mutation_intf > {
    get queryType(): string {
        return 'mutation';
    }
}`;
const fileHeader = `/*******************************************************************
    * Generated with gqlimp v${pgkjson.version}
    * Creation Time: ${new Date()}
*******************************************************************/\n\n`;

class CodeGenerator {

  constructor(options) {
    this._options = options;
    this._dependency = {};
  }

  async generate(kind) {
    this._kind = kind;
    const readSchema = new ReadSchema(this._options);
    const schema = await readSchema.getSchema(this._options);
    this._data = schema.data;
    return this._generate(kind);
  }

  _generate(kind) {

    let str = '';

    if (['all', 'helpers'].indexOf(kind) > -1) {
      // Generate Helper Class
      str += '\n\n' + '/** \n\tHelper Class Declaration \n*/\n';
      str += gqlClasses;
    }

    if (['all', 'customScalars'].indexOf(kind) > -1) {
      // Generate Custom Scalars
      str += '\n\n' + '/** \n\tCustom Scalars Declaration \n*/\n';
      str += this._generateCustomScalar();
    }

    if (['all', 'enums'].indexOf(kind) > -1) {
      //Generate Enum
      str += '\n\n' + '/** \n\tEnum Declaration \n*/\n';
      str += this._generateEnum();
    }

    if (['all', 'args'].indexOf(kind) > -1) {
      //Generate Args
      str += '\n\n' + '/** \n\tArguments Declaration \n*/\n';
      str += this._generateArgs();
      const da = this._dependency['args'];
      if (da) {
        /* istanbul ignore else */
        if (da['customScalars']) {
          str = '\n/** \n\tCustom Scalars Declaration \n*/\n' +
              this._depCustomScalar(da) + str;
        }
        /* istanbul ignore else */
        if (da['enums']) {
          str =
              '\n\n/** \n\tEnum Declaration \n*/\n' +
              this._depEnum(da) + str;
        }
        /* istanbul ignore else */
        if (da['inputs']) {
          str = '\n\n/** \n\tInput Declaration \n*/\n' +
              this._depInput(da) + str;
        }
      }
    }

    if (['all', 'inputs'].indexOf(kind) > -1) {
      //Generate Input
      str += '\n\n' + '/** \n\tInputs Declaration \n*/\n';
      str += this._generateInput();
      const di = this._dependency['inputs'];
      if (di) {
        /* istanbul ignore else */
        if (di['customScalars']) {
          str = '\n/** \n\tCustom Scalars Declaration \n*/\n' +
              this._depCustomScalar(di) + str;
        }
        /* istanbul ignore else */
        if (di['enums']) {
          str =
              '\n\n/** \n\tEnum Declaration \n*/\n' +
              this._depEnum(di) + str;
        }
      }
    }

    if (['all', 'interfaces'].indexOf(kind) > -1) {
      // Generate Interface
      str += interfaceRootObject;
      str += this._generateInterface();
      if (this._options['realType'])
        str += this._generateType();
      const di = this._dependency['interfaces'];
      if (di) {
        /* istanbul ignore else */
        if (di['args']) {
          str =
              '\n/** \n\tArgs Declaration \n*/\n' +
              this._dependencyArgs(di) + str;
        }
        if (di['inputs']) {
          str =
              '\n/** \n\tInputs Declaration \n*/\n' +
              this._depInput(di) + str;
        }
        if (di['enums']) {
          str =
              '\n/** \n\tEnums Declaration \n*/\n' +
              this._depEnum(di) + str;
        }
        if (di['customScalars']) {
          str = '\n/** \n\tCustom Scalars Declaration \n*/\n' +
              this._depCustomScalar(di) + str;
        }
        str = '\n/** \n\tHelper Class Declaration \n*/\n' +
            this._depHelper() + str;
      }

    }

    str = fileHeader + str;

    return str;
  }

  _dependencyArgs(obj) {
    let str = '';
    const ii = [];
    for (const e of Object.keys(obj['args'])) {
      if (this._options['multiFile']) {
        ii.push(e + '_args');
      } else {
        str += this._generateArgs(e);
      }
    }
    if (ii.length > 0) {
      str =
          `import {${ii.join(',')}} from './${this._options['fileName'] +
          '-args'}';\n` + str;
    }
    return str;
  }

  _depInput(obj) {
    let str = '';
    const ii = [];
    for (const e of Object.keys(obj['inputs'])) {
      if (!this._options['multiFile']) {
        str += this._generateInput(e);
      } else {
        ii.push(e);
      }
    }
    if (ii.length > 0) {
      str =
          `import {${ii.join(',')}} from './${this._options['fileName'] +
          '-inputs'}';\n` + str;
    }
    return str;
  }

  _depHelper() {
    let str = '';
    const ie = ['GQLClass', 'GQLWithoutFieldsArgsClass', 'GQLArgsClass',
      'GQLBaseObject'];

    if (!this._options['multiFile']) {
      str += gqlClasses;
    } else {
      str =
          `import {${ie.join(',')}} from './${this._options['fileName'] +
          '-helpers'}';\n` + str;
    }
    return str;
  }

  _depEnum(obj) {
    let str = '';
    const ie = [];
    for (const e of Object.keys(obj['enums'])) {
      if (!this._options['multiFile']) {
        str += this._generateEnum(e);
      } else {
        ie.push(e);
      }
    }
    if (ie.length > 0) {
      str =
          `import {${ie.join(',')}} from './${this._options['fileName'] +
          '-enums'}';\n` + str;
    }
    return str;
  }

  _depCustomScalar(obj) {
    let str = '';
    const ic = [];
    for (const c of Object.keys(obj['customScalars'])) {
      if (!this._options['multiFile']) {
        str += this._generateCustomScalar(c);
      } else {
        ic.push(c);
      }
    }
    if (ic.length > 0) {
      str =
          `import {${ic.join(',')}} from './${this._options['fileName'] +
          '-customScalars'}';\n` + str;
    }
    return str;
  }

  _generateCustomScalar(key) {
    let str = '';
    let custom = {};
    if (key) {
      custom[key] = this._data.customScalars[key];
    } else {
      custom = this._data.customScalars;
    }
    for (const k of Object.keys(custom)) {
      str +=
          'export type ' + k + ' = ' + custom[k] + ';\n\n';
    }
    return str;
  }

  _generateEnum(key) {
    let str = '';
    let enums = {};
    if (key) {
      enums[key] = this._data.enums[key];
    } else {
      enums = this._data.enums;
    }
    for (const i of Object.keys(enums)) {
      str += 'export enum ' + i + ' {\n';
      let a = 0;
      for (const j of Object.keys(enums[i])) {
        str += '\t' + j + ' = \'' + enums[i][j] + '\'';
        if (a < Object.keys(enums[i]).length - 1) {
          str += ',';
        }
        str += '\n';
        a++;
      }
      str += '}\n\n';
    }
    return str;
  }

  _generateArgs(key) {
    let str = '';
    let args = {};
    if (key) {
      args[key] = this._data.args[key];
    } else {
      args = this._data.args;
    }
    for (const k of Object.keys(args)) {
      str += 'export interface ' + k + '_args {\n';
      for (const j of Object.keys(args[k])) {
        let type = args[k][j].type;
        const nonNull = (type.indexOf('!') > -1 ? '' : '?');
        const list = (type.indexOf('[]') > -1 ? '[]' : '');
        type = type.replace('!', '').replace('[]', '');
        if (scalarMapping[type]) {
          type = scalarMapping[type];
        } else {
          this._dependency[this._kind] = this._dependency[this._kind] || {};
          const d = this._dependency[this._kind];
          if (this._data['customScalars'][type]) {
            d['customScalars'] = d['customScalars'] || {};
            d['customScalars'][type] = true;
          } else if (this._data['enums'][type]) {
            d['enums'] = d['enums'] || {};
            d['enums'][type] = true;
          }
          /* istanbul ignore next */
          else if (this._data['inputs'][type]) {
            d['inputs'] = d['inputs'] || {};
            d['inputs'][type] = true;
          }
          /*istanbul ignore next*/
          if (args[type]) {
            type += '_args';
          }
        }
        type += list;
        str +=
            '\t' + j + nonNull + ' : ' + type + ';\n';
      }
      str += '}\n\n';
    }
    return str;
  }

  _generateInput(key) {
    let str = '';
    let inpt = {};
    if (key) {
      inpt[key] = this._data.inputs[key];
    } else {
      inpt = this._data.inputs;
    }
    for (const k of Object.keys(inpt)) {
      str += 'export interface ' + k + ' {\n';
      for (const j of Object.keys(inpt[k])) {
        let type = inpt[k][j].type;
        const nonNull = (type.indexOf('!') > -1 ? '' : '?');
        const list = (type.indexOf('[]') > -1 ? '[]' : '');
        type = type.replace('!', '').replace('[]', '');
        if (scalarMapping[type]) {
          type = scalarMapping[type];
        } else {
          this._dependency[this._kind] = this._dependency[this._kind] || {};
          const d = this._dependency[this._kind];
          if (this._data['customScalars'][type]) {
            d['customScalars'] = d['customScalars'] || {};
            d['customScalars'][type] = true;
          } else if (this._data['enums'][type]) {
            d['enums'] = d['enums'] || {};
            d['enums'][type] = true;
          }
        }
        type += list;
        str +=
            '\t' + j + nonNull + ' : ' + type + ';\n';
      }
      str += '}\n\n';
    }
    return str;
  }

  _generateInterface() {
    let str = '';
    str += '\n\n' + '/** \n\tFields Declaration \n*/\n';
    const intf = this._data.interfaces;
    for (const k of Object.keys(intf)) {
      let cStr = '';
      str += 'export interface ' + k + '_intf {\n';
      for (const j of Object.keys(intf[k])) {
        let type = intf[k][j].type;
        const nonNull = (type.indexOf('!') > -1 ? '' : '?');
        type = type.replace('!', '').replace('[]', '');
        let ftype = type;

        if (scalarMapping[type]) {
          type = scalarMapping[type];
          ftype = 'boolean | number';
          if (intf[k][j].args) {
            ftype = k + '_' + j;
            cStr += this._prepareWithoutFieldsArgClass(ftype, type);
          }
        } else if (this._data.customScalars[type]) {
          ftype = 'boolean | number';
        } else if (this._data.enums[type]) {
          ftype = 'boolean | number';
        }
        /* istanbul ignore next */
        else if (intf[type]) {
          type += '_intf';
          ftype = k + '_' + j;
          if (intf[k][j].args) {
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
    return str;
  }

  _generateType() {
    let str = '';
    str += '\n\n' + '/** \n\tReal Types Declaration \n*/\n';
    const intf = this._data.interfaces;
    for (const k of Object.keys(intf)) {
      str += 'export interface ' + k + ' {\n';
      for (const j of Object.keys(intf[k])) {
        let type = intf[k][j].type;
        const nonNull = (type.indexOf('!') > -1 ? '' : '?');
        type = type.replace('!', '');
        let ftype = type;
        if (scalarMapping[type]) {
          ftype = scalarMapping[type];
        } else if (this._data.customScalars[type] || this._data.enums[type]) {
          ftype = intf[k][j].type;
        }
        /* istanbul ignore next */
        else if (intf[type]) {
          ftype = type;
        }
        ftype = ftype.replace('!', '');
        str += '\t' + j + nonNull + ' : ' + ftype + ';\n';
      }
      str += '}\n\n';
    }
    return str;
  }

  _setDependency(_type) {
    this._dependency[this._kind] = this._dependency[this._kind] || {};
    const d = this._dependency[this._kind];
    if (this._data['args'][_type]) {
      d['args'] = d['args'] || {};
      d['args'][_type] = true;
    }
  }

  _prepareWithoutFieldsArgClass(className) {
    let str = '';
    this._setDependency(className);
    str += 'export class ' + className +
        ' extends GQLWithoutFieldsArgsClass<' + className + '_args' + '>{\n';
    const args = this._data.args[className];
    str +=
        '\n\tconstructor(args : ' + className + '_args ) {\n' +
        '\t\tsuper(args); \n' +
        '\t\tthis.argsMap = {\n';
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
    this._setDependency(className);
    str += 'export class ' + className +
        ' extends GQLArgsClass<' + className + '_args,' +
        typeName +
        '>{\n';
    const args = this._data.args[className];
    str +=
        '\n\tconstructor(args : ' + className + '_args' +
        ', fields : ' + typeName + ') {\n' +
        '\t\tsuper(args, fields); \n' +
        '\t\tthis.argsMap = {\n';
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

}

module.exports = {
  CodeGenerator: CodeGenerator
};
