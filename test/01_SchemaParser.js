/* eslint-disable */
require('./support/env');
const assert = require('assert');
const GQLApplication = require('./support/app');
const SchemaParser = require('../lib/SchemaParser').SchemaParser;
const fs = require('fs');

describe('Parser prepare and properties tests', function() {

  let app;
  const port = 4000;
  const options = {
    fileName: 'test',
    output: './test/output',
    url: 'http://localhost:' + port + '/graphql',
    generate: true
  };

  before(() => {
    app = new GQLApplication();
    return app.start(port);
  });

  after(() => app.stop());

  it('Should created with "test" file name', async () => {
    const sp = new SchemaParser(options);
    await sp.generate();
    assert.strictEqual(fs.existsSync(options.output + '/' +
        options.fileName + '.ts'), true);
  });

  it('Should change "fileName" property', async () => {
    const sp = new SchemaParser(options);
    sp.fileName = 'test1';
    await sp.generate();
    assert.strictEqual(fs.existsSync(options.output + '/' +
        options.fileName + '.ts'), true);
  });

  it('Should work with verbose parameter', async () => {
    const logs = [];
    const hook_stream = function(_stream, fn) {
      let old_write = _stream.write;
      _stream.write = fn;
      return function() {
        _stream.write = old_write;
      };
    };
    const unhook_stdout = hook_stream(process.stdout, function(string) {
      logs.push(string);
    });
    const opt = {...options, ...{verbose: true, generate: false}};
    const sp = new SchemaParser(opt);
    await sp.generate();
    unhook_stdout();
    assert.strictEqual(logs.length > 0, true);
  });

  it('Should be export file in schema types', async () => {
    const sp = new SchemaParser(options);
    await sp.generate();
    assert.strictEqual(fs.existsSync(options.output + '/' +
        options.fileName + '.ts'), true);
    const content = fs.readFileSync(options.output + '/' + options.fileName +
        '.ts');
    assert.strictEqual(content.indexOf('export interface User_intf') >
        -1, true);
    assert.strictEqual(content.indexOf('export interface Phone_intf') >
        -1, true);
    assert.strictEqual(content.indexOf('export interface Country_intf') >
        -1, true);
    sp._addInterface({});
  });

  it('Should be export file in schema enums', async () => {
    const sp = new SchemaParser(options);
    await sp.generate();
    assert.strictEqual(fs.existsSync(options.output + '/' +
        options.fileName + '.ts'), true);
    const content = fs.readFileSync(options.output + '/' + options.fileName +
        '.ts');
    assert.strictEqual(content.indexOf('export enum Gender ') >
        -1, true);
    assert.strictEqual(content.indexOf('export enum UserKind ') >
        -1, true);
    sp._addEnum({name: 'Gender'});
    assert.strictEqual(typeof sp.enums['Gender'], 'object');
  });

  it('Should be export file in schema inputs', async () => {
    const sp = new SchemaParser(options);
    await sp.generate();
    assert.strictEqual(fs.existsSync(options.output + '/' +
        options.fileName + '.ts'), true);
    const content = fs.readFileSync(options.output + '/' + options.fileName +
        '.ts');
    assert.strictEqual(content.indexOf('export interface UserInput_args') >
        -1, true);
    assert.strictEqual(content.indexOf('export interface PhoneInput_args') >
        -1, true);
  });

  it('Should be response null to incorrect url', async () => {
    options.url = options.url + 'a';
    const sp = new SchemaParser(options);
    await sp.generate();
    assert.strictEqual(sp._response, null);
  });

});
