/* eslint-disable */
require('./support/env');
const assert = require('assert');
const GQLApplication = require('./support/app');
const fs = require('fs');
const rimraf = require('rimraf');
const {FileGenerator, prepareProperties} = require('../lib/FileGenerator');
const CodeGenerator = require('../lib/CodeGenerator').CodeGenerator;

describe('FileGenerator Tests', function() {

  let app;
  const port = 4000;
  const options = {
    fileName: 'test',
    output: './test/output',
    url: 'http://localhost:' + port + '/graphql',
    generate: true,
    compileTarget: 'es5',
    compileLib: 'esnext',
    properties: ['all']
  };
  const codeGen = new CodeGenerator(options);

  before(() => {
    app = new GQLApplication();
    return app.start(port);
  });

  after(() => {
    app.stop();
  });

  it('Should generate single "all" file', async () => {
    const content = await codeGen.generate('all');
    const fileGen = new FileGenerator(options);
    const path = options['output'] + '/' + options['fileName'] + '.ts';
    fileGen.generate(content);
    assert.strictEqual(fs.existsSync(path), true);
    rimraf.sync(path);
  });

  it('Should generate with custom fileName', async () => {
    const content = await codeGen.generate('all');
    const fileGen = new FileGenerator(options);
    const fileName = 'example';
    const path = options['output'] + '/' + fileName + '.ts';
    fileGen.generate(content, fileName);
    assert.strictEqual(fs.existsSync(path), true);
    rimraf.sync(path);
  });

  it('Should generate with custom output', async () => {
    const content = await codeGen.generate('all');
    const fileGen = new FileGenerator(options);
    fileGen.output = './test/dist';
    const fileName = 'example';
    fileGen.generate(content, fileName);
    assert.strictEqual(fs.existsSync(fileGen.output + '/' + fileName +
        '.ts'), true);
    rimraf.sync(fileGen.output);
  });

  it('Should prepared properties', async () => {
    let props = prepareProperties({properties: ['all'], multiFile: true});
    assert.strictEqual(props.indexOf('inputs') > -1, true);
    props = prepareProperties({properties: ['interfaces'], multiFile: true});
    assert.strictEqual(props.indexOf('helpers') > -1, true);
    props = prepareProperties({properties: ['enums'], multiFile: false});
    assert.strictEqual(props.indexOf('enums') > -1, true);
    props = prepareProperties({properties: ['custom'], multiFile: false});
    assert.strictEqual(props.length === 0, true);
  });

  it('Should generate with empty content', async () => {
    const fileGen = new FileGenerator(options);
    assert.doesNotThrow(fileGen.generate);
  });

  it('Should compile source code', async () => {
    const content = await codeGen.generate('all');
    const fileGen = new FileGenerator(options);
    const path = [
      options['output'] + '/' + options['fileName'] + '.ts',
      options['output'] + '/' + options['fileName'] + '.js',
      options['output'] + '/' + options['fileName'] + '.d.ts'];
    fileGen.generate(content);
    fileGen.compileSource();
    for (const item of path) {
      assert.strictEqual(fs.existsSync(item), true);
      rimraf.sync(item);
    }
  });

  it('Should generate with empty fileName', async () => {
    const opt = {...options};
    delete opt.fileName;
    const fileGen = new FileGenerator(opt);
    assert.doesNotThrow(fileGen.generate);
  });

});
