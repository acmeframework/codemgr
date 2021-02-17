import { isUsable } from 'af-conditionals';

import {
  appConfig,
  configPathExists,
  copySourceConfigFiles,
  makeConfigPath,
} from './lib/config';
import { askQuestion } from './lib/interact';
import { OUTPUT_INCREASE_INDENT, showOutput } from './lib/logging';
import {
  loadNpmConfiguration,
  NPM_DEFAULT_CONFIG,
  NpmConfigKeys,
  setNpmConfig,
} from './lib/npm';

export async function setup(): Promise<void> {
  showOutput(`Setting up the ${appConfig.appName} configuration`);

  // Setup base configuration folder if it doesn't exist.
  showOutput({
    message: `Setting up configuration directory`,
    indentChange: 1,
  });
  showOutput(OUTPUT_INCREASE_INDENT);
  if (!(await configPathExists())) {
    if (await makeConfigPath()) {
      showOutput(`Created ${appConfig.appName} configuration directory at:`);
      showOutput(`${appConfig.paths.configPath}`);
    } else {
      showOutput({
        message: `Failed to create ${appConfig.paths.configPath}, exiting.`,
        exitCode: 1,
      });
    }
  } else {
    showOutput(`Configuration folder already exists`);
  }
  showOutput({
    message: `Done setting up configuration directory`,
    indentChange: -1,
  });

  // Copy base configuration files to config area - if needed
  showOutput(`Copying default configuration files (if needed)`);
  showOutput(OUTPUT_INCREASE_INDENT);
  await copySourceConfigFiles(appConfig.overwrite, appConfig.backup);
  showOutput({
    message: `Done copying default configuration files`,
    indentChange: -1,
  });

  showOutput({
    message: `Done Setting up the ${appConfig.appName} configuration\n`,
    indentChange: -1,
  });

  // Check NPM configuration
  showOutput(`Checking NPM Configuration`);
  const npmConfig = await loadNpmConfiguration();
  showOutput(OUTPUT_INCREASE_INDENT);
  for (const configKey in NPM_DEFAULT_CONFIG) {
    if (Object.prototype.hasOwnProperty.call(NPM_DEFAULT_CONFIG, configKey)) {
      const configValue = npmConfig[configKey as NpmConfigKeys];
      const defaultValue = NPM_DEFAULT_CONFIG[configKey as NpmConfigKeys];
      if (isUsable(configValue) && configValue === defaultValue) {
        const newValue = await askQuestion(
          `Enter a value for ${configKey}`,
          defaultValue
        );
        if (setNpmConfig(configKey, newValue)) {
          showOutput(`${configKey} set in NPM configuration`);
        } else {
          showOutput(`${configKey} could not be set in NPM configuration`);
        }
      } else {
        showOutput(`${configKey} has a non-default value`);
      }
    }
  }
  showOutput({ message: 'NPM Configuration Check Complete', indentChange: -1 });
}
