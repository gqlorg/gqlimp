const fs = require('fs');
const getFetch = require('gql-fetch').default;
const {scalarMapping} = require('./constants');
const readSchemaQuery = fs.readFileSync(__dirname +
    '/code/read_schema.graphql');

const ignoredProperties =
    ['__DirectiveLocation', '__Directive', '__EnumValue', '__InputValue',
      '__Field', '__TypeKind', '__Type', '__Schema'];

class ReadSchema {

  constructor(options) {
    this._options = options;
  }

  _parseSchema(obj) {

    this.args = {};
    this.inputs = {};
    this.enums = {};
    this.interfaces = {};
    this.customScalars = {};

    for (const i of Object.keys(obj)) {
      if (ignoredProperties.includes(obj[i].name)) {
        continue;
      }
      if (obj[i].kind === 'OBJECT') {
        this._addInterface(obj[i]);
      } else if (obj[i].kind === 'ENUM') {
        this._addEnum(obj[i]);
      } else if (obj[i].kind === 'INPUT_OBJECT') {
        this._addInput(obj[i]);
      }
    }
    return {
      interfaces: this.interfaces,
      enums: this.enums,
      args: this.args,
      customScalars: this.customScalars,
      inputs: this.inputs
    };
  }

  _addInput(obj) {
    this._addBase(obj, this.inputs);
  }

  _addInterface(obj) {
    this._addBase(obj, this.interfaces);
    if (obj.fields) {
      for (const i of Object.keys(obj.fields)) {
        const field = obj.fields[i];
        if (field.args && field.args.length > 0) {
          const tmpObj = {
            kind: 'INPUT_OBJECT',
            name: obj.name + '_' + field.name,
            inputFields: field.args
          };
          this._addBase(tmpObj, this.args);
        }
      }
    }
  }

  _addEnum(obj) {
    this.enums[obj.name] = {};
    for (const i of Object.keys(obj['enumValues'])) {
      const enm = obj['enumValues'][i];
      this.enums[obj.name][enm.name] = enm.name;
    }
  }

  _addBase(obj, ref) {
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

  getSchema(options) {

    if (options)
      this._options = options;

    return getFetch(this._options.url)(readSchemaQuery)
        .then((response) => {
          const res = {status: response.status};
          /*istanbul ignore next*/
          if (response.status !== 200) {
            res.error = JSON.stringify(response.json);
          } else {
            res.data =
                this._parseSchema(response.json['data']['__schema']['types']);
          }
          return res;
        })
        .catch(error => {
          return {status: error.status, error: error};
        });
  }
}

module.exports = {
  ReadSchema: ReadSchema
};
