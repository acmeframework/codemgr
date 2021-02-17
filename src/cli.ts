#!/usr/bin/env node

import yargs, { Arguments } from 'yargs';

import { logger, LogSeverity } from 'af-utilities';

import { ArgOptions, appConfig, initConfig } from './lib/config';

import { init } from './init';
import { setup } from './setup';

async function startApp(argv: Arguments): Promise<void> {
  if (argv.debug) {
    logger.severityLevel = LogSeverity.Debug;
  }

  const options: ArgOptions = {
    overwrite: argv.overwrite as boolean,
    backup: argv.backup as boolean,
  };

  const commands = argv._;
  if (commands) {
    if (commands[0] === 'init') {
      await initConfig(options);
      await init();
    } else if (commands[0] === 'setup') {
      await initConfig(options, undefined, false);
      await setup();
    }
  }
}

/*
 *****************************************************************************
 * Start Application
 *****************************************************************************
 */

// Parse my yargs...
yargs(process.argv.slice(2))
  .option('debug', {
    alias: 'D',
    type: 'boolean',
    description: 'Run with debug output',
  })
  .option('overwrite', {
    alias: 'O',
    type: 'boolean',
    description: 'Overwrite destination files with the files to be copied.',
  })
  .option('backup', {
    alias: 'B',
    type: 'boolean',
    description:
      'Only meaningful if overwrite has been specified, if so, backup any files that will be overwritten.',
  })
  .command(
    'setup',
    `setup ${appConfig.appName} for usage under your account`,
    () => {}, // eslint-disable-line
    async (argv) => {
      await startApp(argv);
    }
  )
  .command(
    'init [template]',
    `use ${appConfig.appName} to initialize your repo`,
    (yargs) => {
      yargs.positional('template', {
        describe:
          'template to initialize repo with, must be a valid template in your codemgr config folder',
        type: 'string',
        default: 'default',
      });
    },
    async (argv) => {
      await startApp(argv);
    }
  )
  .demandCommand()
  .help().argv;
