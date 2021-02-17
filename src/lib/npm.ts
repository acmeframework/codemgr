import { LogSeverity } from 'af-utilities';
import { pathExists, readJSONFile } from './file-utils';
import { showOutput } from './logging';
import { executeCommand, executeCommandWithOutput } from './proc-utils';

const NPM_PACKAGE_JSON_FILENAME = 'package.json';
const NPM_COMMAND = 'npm';

export async function executeNpmCommand(
  cmdArguments: string[]
): Promise<boolean> {
  return await executeCommand(NPM_COMMAND, cmdArguments);
}

export async function initNpm(): Promise<boolean> {
  return await executeNpmCommand(['init', '-y']);
}

export async function isNpmInitialized(): Promise<boolean> {
  return await pathExists(NPM_PACKAGE_JSON_FILENAME);
}

export async function setNpmConfig(
  configKey: string,
  configValue: string
): Promise<boolean> {
  return await executeNpmCommand(['set', `${configKey}=${configValue}`]);
}

// Define our internal package list types
export type NpmDependencyList = string[];

export interface NpmDependencyLists {
  dependencies: NpmDependencyList;
  devDependencies: NpmDependencyList;
}

export type NpmDependencyListsKeys = keyof NpmDependencyLists;

// Define types matching the NPM package information
export interface NpmGroupedStringValues {
  [key: string]: string;
}

interface NpmPackageInformation {
  dependencies?: NpmGroupedStringValues;
  devDependencies?: NpmGroupedStringValues;
  scripts?: NpmGroupedStringValues;
}

interface NpmConfig {
  'init-author-name': string;
  'init-author-email': string;
  'init-author-url': string;
  'init-version': string;
  'init-license': string;
}
export type NpmConfigKeys = keyof NpmConfig;

const NPM_DEFAULT_INIT_VERSION = '1.0.0';
const NPM_DEFAULT_LICENSE = 'ISC';
export const NPM_DEFAULT_CONFIG: NpmConfig = {
  'init-author-name': '',
  'init-author-email': '',
  'init-author-url': '',
  'init-version': NPM_DEFAULT_INIT_VERSION,
  'init-license': NPM_DEFAULT_LICENSE,
};

/*
const NPM_DEFAULT_TEST_SCRIPT =
  'echo "Error: no test specified" && exit 1';
*/

export async function readNpmPackageInfo(
  path: string
): Promise<NpmPackageInformation> {
  return await readJSONFile<NpmPackageInformation>(
    `${path}/${NPM_PACKAGE_JSON_FILENAME}`
  );
}

export async function loadNpmConfiguration(): Promise<NpmConfig> {
  const output = await executeCommandWithOutput(NPM_COMMAND, [
    'config',
    'list',
    '--json',
  ]);
  const npmConfig: NpmConfig = JSON.parse(output);
  return npmConfig;
}

export class NpmPackage {
  // Raw package.json
  protected _packageData: NpmPackageInformation = {};

  // Dependencies
  protected _packageLists: NpmDependencyLists = {
    dependencies: [],
    devDependencies: [],
  };

  // Raw result of `npm config list --json`
  protected _npmConfig: NpmConfig = {
    'init-author-email': '',
    'init-author-name': '',
    'init-author-url': '',
    'init-license': '',
    'init-version': '',
  };

  constructor(packageData: NpmPackageInformation) {
    this._loadRepoPackageJson(packageData);
  }

  public isPackageInstalled(
    packageName: string,
    dependencyType: NpmDependencyListsKeys,
    packageVersion?: string
  ): number {
    const packageList = this._packageLists[dependencyType];
    if (packageList.length === 0) {
      return 0;
    }
    let idx: number;
    if (packageVersion) {
      idx = packageList.indexOf(`${packageName}@${packageVersion}`);
      if (idx >= 0) return 2;
    }
    idx = packageList.indexOf(packageName);
    if (idx >= 0) return 1;
    return 0;
  }

  public isScriptPresent(scriptName: string, scriptValue?: string): number {
    const scriptsList = this._packageData['scripts'];
    if (scriptsList) {
      const script = scriptsList[scriptName];
      if (script) {
        if (scriptValue && script === scriptValue) {
          return 2;
        } else {
          return 1;
        }
      }
    }
    return 0;
  }

  protected _loadRepoPackageJson(packageData: NpmPackageInformation): void {
    this._packageData = packageData;
    this._loadDependencies();
  }

  private _loadDependencies(): void {
    for (const key in this._packageLists) {
      if (Object.prototype.hasOwnProperty.call(this._packageLists, key)) {
        const dependencyType = key as NpmDependencyListsKeys;
        const packageDependencyList = this._packageData[dependencyType];
        if (packageDependencyList) {
          this._packageLists[dependencyType] = this._flattenDependencyList(
            dependencyType
          );
        }
      }
    }
  }

  private _flattenDependencyList(
    dependencyType: NpmDependencyListsKeys
  ): string[] {
    const dependencyList: string[] = [];
    const packageDependencyList = this._packageData[dependencyType];
    for (const key in packageDependencyList) {
      if (Object.prototype.hasOwnProperty.call(packageDependencyList, key)) {
        dependencyList.push(`${key}`);
        dependencyList.push(`${key}@${packageDependencyList[key]}`);
      }
    }
    return dependencyList;
  }
}

type PackageInstallationSpec = {
  [dependencyType in NpmDependencyListsKeys]: string;
};

const PACKAGE_INSTALLATION_INFO: PackageInstallationSpec = {
  dependencies: '--save',
  devDependencies: '--save-dev',
};

export async function npmPackageInstaller(
  packageList: NpmDependencyList,
  installType: NpmDependencyListsKeys
): Promise<boolean> {
  if (packageList.length === 0) return Promise.resolve(true);

  const cmdArguments: string[] = [
    'install',
    `${PACKAGE_INSTALLATION_INFO[installType]}`,
  ].concat(packageList);
  showOutput({
    message: `NPM Install Command: ${cmdArguments.join(' ')}`,
    severity: LogSeverity.Debug,
  });
  return await executeNpmCommand(cmdArguments);
}
