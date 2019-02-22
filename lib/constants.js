const cliOptions = [
  {name: 'verbose', alias: 'v', type: Boolean},
  //   {name: 'lib', type: String, multiple: true, defaultOption: true},
  {name: 'url', alias: 'u', type: String},
  {name: 'generate', alias: 'g', type: Boolean},
  {name: 'fileName', alias: 'f', type: String},
  {name: 'output', alias: 'o', type: String},
  {name: 'help', alias: 'h', type: Boolean},
  {name: 'type', alias: 't', type: String, defaultOption: 'ts'}
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
        typeLabel: '{italic default "schema-types"}',
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
        name: 'type',
        typeLabel: '{italic options "ts", "js" default "ts"}',
        description: '(-t) This parameter to output "typescript" or "javascript"'
      },
      {
        name: 'help',
        description: '(-h) Print this usage guide.'
      }
    ]
  }
];

module.exports = {
  cliOptions,
  cliHelpSections
};

