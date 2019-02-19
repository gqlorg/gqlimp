const graphql = require('graphql');
const GraphQLScalarType = graphql.GraphQLScalarType;

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms).unref();
  });
}

module.exports = {

  HashID: new GraphQLScalarType({
    name: 'HashID',
    description: 'Date custom scalar type',
    parseValue(value) {
      return value; // value from the client
    },
    serialize(value) {
      return value; // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === graphql.Kind.STRING) {
        return ast.value; // ast value is always in string format
      }
      return null;
    }
  }),

  user: (parent) => {
    return {id: 1, name: 'Test User 1'};
  },
  users: () => {
    return [
      {id: 1, name: 'Test User 1'},
      {id: 2, name: 'Test User 2'},
      {id: 3, name: 'Test User 3'}];
  },

  timeoutServer: async (args) => {
    await delay(args.interval);
    return 'timeout';
  },

  serverName: () => {
    return 'serverName';
  }

};
