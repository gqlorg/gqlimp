/* eslint-disable */
require('./support/env');
const assert = require('assert');
const GQLApplication = require('./support/app');
const fs = require('fs');
const FileBuilder = require('../lib/FileBuilder').FileBuilder;
const ReadSchema = require('../lib/ReadSchema').ReadSchema;

describe('FileBuilder Tests', function() {

  let app;
  const port = 4000;
  const options = {
    fileName: 'test',
    output: './test/output',
    url: 'http://localhost:' + port + '/graphql',
    generate: true,
    properties: ['all']
  };

  before(() => {
    app = new GQLApplication();
    return app.start(port);
  });

  after(() => app.stop());

  it('Should generate "all" kind file', async () => {
    const rs = new ReadSchema(options);
    const res = await rs.getSchema();
    const fb = new FileBuilder(options, res.data);
    const kind = 'all';
    fb.generate(kind);
    assert.strictEqual(fs.existsSync(options.output + '/' +
        options.fileName + '-' + kind + '.ts'), true);
  });

  it('Should change file name', async () => {
    const rs = new ReadSchema(options);
    const res = await rs.getSchema();
    const fb = new FileBuilder(options, res.data);
    fb.fileName += '1';
    const kind = 'all';
    fb.generate(kind);
    assert.strictEqual(fs.existsSync(options.output + '/' +
        fb.fileName + '-' + kind + '.ts'), true);
  });

  it('Should generate "enums" kind file', async () => {
    const rs = new ReadSchema(options);
    const res = await rs.getSchema();
    const fb = new FileBuilder(options, res.data);
    const kind = 'enums';
    fb.generate(kind);
    assert.strictEqual(fs.existsSync(options.output + '/' +
        options.fileName + '-' + kind + '.ts'), true);
  });

  it('Should generate "inputs" kind file', async () => {
    const rs = new ReadSchema(options);
    const res = await rs.getSchema();
    const fb = new FileBuilder(options, res.data);
    const kind = 'inputs';
    fb.generate(kind);
    assert.strictEqual(fs.existsSync(options.output + '/' +
        options.fileName + '-' + kind + '.ts'), true);
  });

  it('Should generate "customScalars" kind file', async () => {
    const rs = new ReadSchema(options);
    const res = await rs.getSchema();
    const fb = new FileBuilder(options, res.data);
    const kind = 'customScalars';
    fb.generate(kind);
    assert.strictEqual(fs.existsSync(options.output + '/' +
        options.fileName + '-' + kind + '.ts'), true);
  });

  it('Should generate "interfaces" kind file', async () => {
    const rs = new ReadSchema(options);
    const res = await rs.getSchema();
    const fb = new FileBuilder(options, res.data);
    const kind = 'interfaces';
    fb.generate(kind);
    assert.strictEqual(fs.existsSync(options.output + '/' +
        options.fileName + '-' + kind + '.ts'), true);
  });

  it('Should generate "args" kind file', async () => {
    const rs = new ReadSchema(options);
    const res = await rs.getSchema();
    const fb = new FileBuilder(options, res.data);
    const kind = 'args';
    fb._setDependency('a');
    fb.generate(kind);
    assert.strictEqual(fs.existsSync(options.output + '/' +
        options.fileName + '-' + kind + '.ts'), true);
  });

  it('Should generate with multiFile option', async () => {
    const opt = {...options};
    opt.multiFile = true;
    opt.fileName += '-m';
    const rs = new ReadSchema(opt);
    const res = await rs.getSchema();
    const fb = new FileBuilder(opt, res.data);
    for (const item of ['enums', 'interfaces', 'customScalars',
      'helpers', 'inputs', 'args']) {
      fb.generate(item);
    }
    assert.strictEqual(fs.existsSync(opt.output + '/' +
        opt.fileName + '-enums.ts'), true);
    assert.strictEqual(fs.existsSync(opt.output + '/' +
        opt.fileName + '-args.ts'), true);
    assert.strictEqual(fs.existsSync(opt.output + '/' +
        opt.fileName + '-inputs.ts'), true);
    assert.strictEqual(fs.existsSync(opt.output + '/' +
        opt.fileName + '-customScalars.ts'), true);
    assert.strictEqual(fs.existsSync(opt.output + '/' +
        opt.fileName + '-interfaces.ts'), true);
  });

});
