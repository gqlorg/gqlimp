const schema = require('./schema');

const express = require('express');
const graphqlHTTP = require('express-graphql');
const resolvers = require('./resolvers');

module.exports = class GqlApplication {

  constructor() {

    this.express = express();
    this.express.use('/graphql', graphqlHTTP((req, res) => {
      res.set('Access-Control-Allow-Origin', '*');
      if (req.headers.authorization) {
        const header = req.headers.authorization;
        res.setHeader('authorization', header);
      }
      return {
        schema: schema,
        rootValue: resolvers,
        graphiql: true,
        context: {
          request: req,
          response: res
        }
      };
    }));
  }

  start(port) {
    this.server = this.express.listen(port || 4000);
  }

  stop() {
    this.server.close();
  }
};
