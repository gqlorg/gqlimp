/* eslint-disable */
require('./support/env');
const assert = require('assert');
const GQLApplication = require('./support/app');
const CodeGenerator = require('../lib/CodeGenerator').CodeGenerator;

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
    const cg = new CodeGenerator(options);
    const content = await cg.generate('all');
    assert.strictEqual(!!content, true);
  });

  it('Should generate "enums" kind file', async () => {
    const cg = new CodeGenerator(options);
    const content = await cg.generate('enums');
    assert.strictEqual(!!content, true);
  });

  it('Should generate "inputs" kind file', async () => {
    const cg = new CodeGenerator(options);
    const content = await cg.generate('inputs');
    assert.strictEqual(!!content, true);
  });

  it('Should generate "customScalars" kind file', async () => {
    const cg = new CodeGenerator(options);
    const content = await cg.generate('customScalars');
    assert.strictEqual(!!content, true);
  });

  it('Should generate "interfaces" kind file', async () => {
    const cg = new CodeGenerator(options);
    const content = await cg.generate('interfaces');
    assert.strictEqual(!!content, true);
  });

  it('Should generate "args" kind file', async () => {
    const cg = new CodeGenerator(options);
    const content = await cg.generate('args');
    cg._setDependency('a');
    assert.strictEqual(!!content, true);
  });

  it('Should generate with multiFile option', async () => {
    const opt = {...options};
    opt.multiFile = true;
    opt.fileName += '-m';
    const cg = new CodeGenerator(opt);
    for (const item of ['enums', 'interfaces', 'customScalars',
      'helpers', 'inputs', 'args']) {
      const content = await cg.generate(item);
      assert.strictEqual(!!content, true);
    }
  });

});
