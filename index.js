#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const commandLineArgs = require('command-line-args');
const ReadSchema = require('./lib/ReadSchema').ReadSchema;
const CodeGenerator = require('./lib/CodeGenerator').CodeGenerator;
const {FileGenerator, prepareProperties} = require('./lib/FileGenerator');
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

    const props = prepareProperties({
      properties: options['properties'],
      multiFile: options['multiFile']
    });

    if (options['verbose']) {

      const readSchema = new ReadSchema(options);
      const schema = await readSchema.getSchema(options);

      if (props.includes('all'))
        console.log(schema.data);
      else {
        for (const k of props) {
          console.log(schema.data[k]);
        }
      }

    } else if (options['generate']) {

      const codeGenerator = new CodeGenerator(options);

      const fg = new FileGenerator({
        output: options['output'],
        compileTarget: options['compileTarget'],
        compileLib: options['compileLib']
      });

      for (const key of props) {

        const content = await codeGenerator.generate(key);
        const err = fg.generate(content, options['fileName'] + '-' + key);
        if (err) {
          console.error(chalk['red'](err));
        }
      }

      if (options['type'] === 'js') {
        for (const k of props) {
          fg.fileName = options['fileName'] + '-' + k;
          const err = fg.compileSource();
          if (err) {
            console.log(chalk['red'](err));
          }
        }
      }

    }
  }
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});


