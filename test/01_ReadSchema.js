/* eslint-disable */
require('./support/env');
const assert = require('assert');
const GQLApplication = require('./support/app');
const fs = require('fs');
const ReadSchema = require('../lib/ReadSchema').ReadSchema;

describe('ReadSchema Tests', function() {

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

  it('Should read schema successful', async () => {
    const rs = new ReadSchema(options);
    const res = await rs.getSchema();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(typeof res.data, 'object');
  });

  it('Should read schema successful with options', async () => {
    const rs = new ReadSchema();
    const res = await rs.getSchema(options);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(typeof res.data, 'object');
  });

  it('Should be read failure with wrong url', async () => {
    const rs = new ReadSchema();
    const opt = {...options};
    opt.url += 'a';
    const res = await rs.getSchema(opt);
    assert.strictEqual(res.status !== 200, true);
  });

  it('Should be validate schema properties', async () => {
    const rs = new ReadSchema(options);
    const res = await rs.getSchema();
    rs._addInterface({});
    assert.strictEqual(typeof res.data.enums, 'object');
    assert.strictEqual(typeof res.data.interfaces, 'object');
    assert.strictEqual(typeof res.data.inputs, 'object');
    assert.strictEqual(typeof res.data.customScalars, 'object');
  });

});
