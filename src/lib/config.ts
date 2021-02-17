import * as path from 'path';

import {
  copyFiles,
  fileExists,
  mkdir,
  pathExists,
  readJSONFile,
} from './file-utils';
import { showOutput } from './logging';
import { NpmGroupedStringValues } from './npm';
import { CURRENT_PATH, SCRIPT_PATH, USER_HOME_PATH } from './proc-utils';

const APP_NAME: Readonly<string> = 'codemgr';
const CODEMGR_DIR: Readonly<string> = `.${APP_NAME}`;
const CODEMGR_TEMPLATE_DIR: Readonly<string> = 'templates';
const CODEMGR_PATH: Readonly<string> = path.join(USER_HOME_PATH, CODEMGR_DIR);
const CODEMGR_PATH_MODE: Readonly<number> = 0o770;
const CODEMGR_TEMPLATE_PATH: Readonly<string> = path.join(
  CODEMGR_PATH,
  CODEMGR_TEMPLATE_DIR
);

export interface ArgOptions {
  overwrite?: boolean;
  backup?: boolean;
}
const OPTIONS_DEFAULT_OVERWRITE: Readonly<boolean> = false;
const OPTIONS_DEFAULT_BACKUP: Readonly<boolean> = false;

interface Config {
  defaultTemplate: string;
}

interface TemplateConfigChecks {
  gitInit: boolean;
  npmInit: boolean;
  requiredPackages: boolean;
  scripts: boolean;
  templateFiles: boolean;
}

interface TemplateConfig {
  checks: TemplateConfigChecks;
  requiredPackages?: {
    dependencies: string[];
    devDependencies: string[];
  };
  scripts?: NpmGroupedStringValues;
}

export const TEMPLATE_CHECKS: Readonly<TemplateConfigChecks> = {
  gitInit: true,
  npmInit: true,
  requiredPackages: true,
  scripts: true,
  templateFiles: true,
};

interface AppConfig {
  appName: string;
  argOptions: ArgOptions;
  backup: boolean;
  template: string;
  loggingHeaders: {
    debug: string;
    error: string;
  };
  overwrite: boolean;
  paths: {
    configPath: string;
    currentPath: string;
    scriptPath: string;
    templatePath: string;
    userHomePath: string;
  };
  templateConfig: TemplateConfig;
}

export const appConfig: AppConfig = {
  appName: APP_NAME,
  argOptions: {
    overwrite: OPTIONS_DEFAULT_OVERWRITE,
    backup: OPTIONS_DEFAULT_BACKUP,
  },
  backup: OPTIONS_DEFAULT_BACKUP,
  template: 'default.json',
  loggingHeaders: {
    debug: `[${APP_NAME} DBG]`,
    error: `[${APP_NAME} ERR]`,
  },
  overwrite: OPTIONS_DEFAULT_OVERWRITE,
  paths: {
    configPath: CODEMGR_PATH,
    currentPath: CURRENT_PATH,
    scriptPath: SCRIPT_PATH,
    templatePath: CODEMGR_TEMPLATE_PATH,
    userHomePath: USER_HOME_PATH,
  },
  templateConfig: {
    checks: {
      gitInit: true,
      npmInit: true,
      requiredPackages: true,
      scripts: true,
      templateFiles: true,
    },
    requiredPackages: {
      dependencies: [],
      devDependencies: [],
    },
    scripts: {},
  },
};

const BASE_CONFIG_PATH = '../base-config';
const CONFIG_FILENAME = 'config.json';

export async function initConfig(
  argOptions: ArgOptions,
  template?: string,
  readConfigs = true
): Promise<void> {
  appConfig.argOptions = argOptions;
  appConfig.backup = argOptions.backup || OPTIONS_DEFAULT_BACKUP;
  appConfig.overwrite = argOptions.overwrite || OPTIONS_DEFAULT_OVERWRITE;

  if (!readConfigs) return;

  const configPath = path.join(appConfig.paths.configPath, CONFIG_FILENAME);
  if (!(await fileExists(configPath))) {
    showOutput({
      message: `${CONFIG_FILENAME} file not found. Run setup again.`,
      exitCode: 1,
    });
  }
  const config = await readJSONFile<Config>(configPath);
  if (!template) {
    template = config.defaultTemplate;
  }

  const templatePath = path.join(appConfig.paths.templatePath, template);
  if (await fileExists(templatePath)) {
    appConfig.template = template;
  } else {
    showOutput({ message: `${template} not found`, exitCode: 1 });
  }

  appConfig['templateConfig'] = await readJSONFile<TemplateConfig>(
    templatePath
  );
}

export async function configPathExists(): Promise<boolean> {
  return await pathExists(appConfig.paths.configPath);
}

export async function makeConfigPath(): Promise<boolean> {
  return await mkdir(appConfig.paths.configPath, true, CODEMGR_PATH_MODE);
}

export async function copySourceConfigFiles(
  overwrite = false,
  backup = false
): Promise<void> {
  const srcPath = path.join(SCRIPT_PATH, BASE_CONFIG_PATH);
  const dstPath = appConfig.paths.configPath;
  if (await copyFiles(srcPath, dstPath, overwrite, CODEMGR_PATH_MODE, backup)) {
    showOutput(`Base configuration files copied to ${dstPath}`);
  } else {
    showOutput({
      message: `Base configuration files failed to be copied.`,
      exitCode: 1,
    });
  }
}

export async function copyRepoConfigFiles(
  overwrite = false,
  backup = false
): Promise<void> {
  const srcPath = path.join(
    appConfig.paths.templatePath,
    path.basename(appConfig.template, '.json')
  );
  const dstPath = CURRENT_PATH;
  if (await copyFiles(srcPath, dstPath, overwrite, undefined, backup)) {
    showOutput(`Configuration files copied to ${dstPath}`);
  } else {
    showOutput({
      message: `Configuration files failed to be copied.`,
      exitCode: 1,
    });
  }
}
