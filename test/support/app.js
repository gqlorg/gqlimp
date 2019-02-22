const schema = require('./schema');

const express = require('express');
const graphqlHTTP = require('express-graphql');
const resolvers = require('./resolvers');

module.exports = class GQLApplication {

  constructor() {

    this.app = express();
    this.app.use('/graphql', graphqlHTTP(() => ({
          schema: schema,
          rootValue: resolvers
        }))
    );
  }

  start(port) {
    return new Promise(((resolve, reject) => {
      this.server = this.app.listen(port || 4000, (err) => {
        if (err)
          return reject(err);
        resolve();
      });
    }));
  }

  stop() {
    return new Promise((resolve => {
      this.server.on('close', resolve);
      this.server.close();
    }));
  }
};
