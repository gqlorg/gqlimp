const fs = require('fs');
const execSync = require('child_process').execSync;

const permitted = ['enums', 'interfaces', 'customScalars',
  'helpers', 'inputs', 'args'];

const prepareProperties = ({properties, multiFile}) => {
  let props = [];

  for (const item of properties) {
    const index = permitted.indexOf(item);
    if (index > -1 || item === 'all') {
      props.push(item);
    }
  }

  if (props.length === 1 &&
      props[0] === 'all' &&
      multiFile) {
    props = permitted;
  }

  if (multiFile && props.includes('interfaces')) {
    const dep = ['helpers', 'args'];
    for (const k of dep) {
      if (!props.includes(k))
        props.push(k);
    }
  }
  return props;
};

class FileGenerator {

  constructor({fileName, content, output, compileTarget, compileLib}) {
    this._fileName = fileName || 'schema.ts';
    this._content = content || '';
    this._output = output;
    this._compileTarget = compileTarget;
    this._compieLib = compileLib;
  }

  set fileName(value) {
    this._fileName = value;
  }

  get fileName() {
    return this._fileName;
  }

  set content(value) {
    this._content = value;
  }

  get content() {
    return this._content;
  }

  set output(value) {
    this._output = value;
  }

  get output() {
    return this._output;
  }

  generate(content, fileName) {
    if (fileName) {
      this.fileName = fileName;
    }
    if (content) {
      this.content = content;
    }
    try {
      /*istanbul ignore else*/
      if (this.output) {
        try {
          fs.statSync(this.output);
        } catch (e) {
          /*istanbul ignore next*/
          fs.mkdirSync(this.output);
        }
      }
      fs.writeFileSync(this.output + '/' + this.fileName +
          '.ts', this.content, 'utf8');
      return null;
    } catch (err) {
      /*istanbul ignore next*/
      return err.toString();
    }
  }

  compileSource() {
    try {
      execSync('tsc ./' + this.output + '/' + this.fileName + '.ts' +
          ' --target ' + this._compileTarget +
          ' --downlevelIteration --lib ' + this._compieLib +
          ' --declaration true');
      return null;
    } catch (err) {
      /*istanbul ignore next*/
      return err.message;
    }
  }

}

module.exports = {
  FileGenerator: FileGenerator,
  prepareProperties: prepareProperties
};
