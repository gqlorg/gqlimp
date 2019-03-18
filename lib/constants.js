const cliOptions = [
  {name: 'verbose', alias: 'v', type: Boolean},
  {name: 'url', alias: 'u', type: String},
  {name: 'generate', alias: 'g', type: Boolean},
  {name: 'help', alias: 'h', type: Boolean},
  {
    name: 'properties',
    alias: 'p',
    type: String,
    multiple: true,
    defaultOption: true,
    defaultValue: 'all'
  },
  {
    name: 'fileName',
    alias: 'f',
    type: String,
    defaultValue: 'schema'
  },
  {
    name: 'output',
    alias: 'o',
    type: String,
    defaultValue: 'output'
  },
  {
    name: 'type',
    alias: 't',
    type: String,
    defaultValue: 'ts'
  },
  {
    name: 'realTypes',
    alias: 'r',
    type: Boolean,
    defaultValue: false
  },
  {
    name: 'multiFile',
    alias: 'm',
    type: Boolean,
    defaultValue: false
  },
  {
    name: 'compileTarget',
    alias: 'c',
    type: String,
    defaultValue: 'es5'
  },
  {
    name: 'compileLib',
    alias: 'l',
    type: String,
    defaultValue: 'esnext'
  }
];

const cliHelpSections = [
  {
    header: 'GQL Importer',
    content: 'Import graphql schema to typescript or javascript'
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'url',
        typeLabel: '{underline required}',
        description: '(-u) This parameter graphql server url'
      },
      {
        name: 'fileName',
        typeLabel: '{italic default "schema-all"}',
        description: '(-f) This parameter output schema file name'
      },
      {
        name: 'generate',
        typeLabel: '{italic optional}',
        description: '(-g) This parameter with generate output file'
      },
      {
        name: 'output',
        typeLabel: '{italic default "output"}',
        description: '(-o) This parameter output folder path'
      },
      {
        name: 'verbose',
        typeLabel: '{italic optional}',
        description: '(-v) This parameter print schema console'
      },
      {
        name: 'properties',
        typeLabel: '{italic options "enums","interfaces","inputs","customScalars","helpers","args" default "all"}',
        description: '(-p) You can choose specific properties with parameter'
      },
      {
        name: 'type',
        typeLabel: '{italic options "ts", "js" default "ts"}',
        description: '(-t) This parameter outputs file "typescript" or "javascript"'
      },
      {
        name: 'realTypes',
        typeLabel: '{italic options true, false default false}',
        description: '(-r) This parameter add object real types'
      },
      {
        name: 'compileTarget',
        typeLabel: '{italic options "es5", "es6", "es2016", "es2017", "esnext" default "es5"}',
        description: '(-c) You can choose compile target with parameter'
      },
      {
        name: 'compileLib',
        typeLabel: '{italic options "es5", "es6", "es2016", "es2017", "esnext" default "esnext"}',
        description: '(-t) You can choose compile lib with parameter'
      },
      {
        name: 'help',
        description: '(-h) Print this usage guide.'
      }
    ]
  }
];

const scalarMapping = {
  String: 'string',
  Int: 'number',
  Float: 'number',
  Boolean: 'boolean',
  Date: 'string'
};

module.exports = {
  cliOptions,
  cliHelpSections,
  scalarMapping
};

