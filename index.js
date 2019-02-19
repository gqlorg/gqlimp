#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const commandLineArgs = require('command-line-args');
const SchemaParser = require('./lib/SchemaParser').SchemaParser;

const {helpSections, optionDefinitions} = require('./lib/constants');
const options = commandLineArgs(optionDefinitions, {stopAtFirstUnknown: true});
const usage = commandLineUsage(helpSections);

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
  }

  if (!options['url']) {
    console.error(chalk.red('Host "--url" not found'));
    return;
  }

  if (!options['verbose'] && !options['generate']) {
    console.error(chalk.red('Please make a choice "--verbose" and/or "--generate"'));
    return;
  }

  if (options['generate'] || options['verbose']) {

    const schemaParser = new SchemaParser(options);

    if (options['generate']) {
      schemaParser.generate();

      if (options['type'] === 'js') {

        const exec = require('child_process').exec;
        exec('tsc --rootDir ./output',
            function(error) {
              if (error !== null) {
                console.error(chalk.red('exec error: ' + error));
              }
            });
      }

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


