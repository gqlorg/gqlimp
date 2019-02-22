#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const commandLineArgs = require('command-line-args');
const SchemaParser = require('./lib/SchemaParser').SchemaParser;
const {cliHelpSections, cliOptions} = require('./lib/constants');

const options = commandLineArgs(cliOptions, {stopAtFirstUnknown: true});
const usage = commandLineUsage(cliHelpSections);

async function run() {

  if (options['_unknown']) {
    for (const i in options['_unknown']) {
      if (options['_unknown'].hasOwnProperty(i))
        console.log(chalk.red(options['_unknown'][i] + ' Command not found'));
    }
    return;
  }

  if (options['help']) {
    console.log(chalk.blue(usage));
    return;
  }

  if (!options['url']) {
    console.error(chalk.red('Host "--url" not found. Did you need help? Try --help'));
    return;
  }

  if (!options['verbose'] && !options['generate']) {
    console.error(chalk.red('Please make a choice "--verbose" and/or "--generate"'));
    return;
  }

  options['output'] = options['output'] || 'output';
  options['fileName'] = options['fileName'] || 'schema-types';

  if (options['generate'] || options['verbose']) {

    const schemaParser = new SchemaParser(options);

    await schemaParser.generate();

    if (options['type'] === 'js') {

      const exec = require('child_process').exec;
      exec('tsc ./' + options['output'] + '/' +
          options['fileName'] +
          '.ts --target es5 --downlevelIteration --lib esnext --declaration true',
          function(error) {
            if (error !== null) {
              console.error(chalk.red('exec error: ' + error));
            }
          });
    }

    if (options['verbose']) {
      console.log(schemaParser.content);
    }
  }

}

run().catch(e => {
  console.error(e);
  process.exit(1);
});


