#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const commandLineArgs = require('command-line-args');
const ReadSchema = require('./lib/ReadSchema').ReadSchema;
const FileBuilder = require('./lib/FileBuilder').FileBuilder;
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

  if (options['generate'] || options['verbose']) {

    const readSchema = new ReadSchema(options);
    const schema = await readSchema.getSchema(options);
    const permitted = ['enums', 'interfaces', 'customScalars',
      'helpers', 'inputs', 'args'];
    let trusted = [];

    for (const item of options['properties']) {
      const index = permitted.indexOf(item);
      if (index > -1 || item === 'all') {
        trusted.push(item);
      }
    }

    if (trusted.length === 1 &&
        trusted[0] === 'all' &&
        options['multiFile']) {
      trusted = permitted;
    }

    if (options['multiFile'] && trusted.includes('interfaces')) {
      const dep = ['helpers', 'args'];
      for (const k of dep) {
        if (!trusted.includes(k))
          trusted.push(k);
      }
    }

    if (trusted.length === 0) return;

    if (options['verbose']) {
      if (trusted.includes('all'))
        console.log(schema.data);
      else {
        for (const k of trusted) {
          console.log(schema.data[k]);
        }
      }
    } else {
      const fileBuilder = new FileBuilder(options, schema.data);
      const files = [];

      for (const key of trusted) {
        fileBuilder.generate(key);
        files.push('./' + options['output'] + '/' +
            options['fileName'] + '-' + key + '.ts');
      }

      if (options['type'] === 'js') {

        const execSync = require('child_process').execSync;
        execSync('tsc ' + files.join(' ') +
            ' --target ' + options['compileTarget'] +
            ' --downlevelIteration --lib ' + options['compileLib'] +
            ' --declaration true',
            function(error) {
              if (error !== null) {
                console.error(chalk.red('exec error: ' + error));
              }
            });
      }

    }

  }

}

run().catch(e => {
  console.error(e);
  process.exit(1);
});


