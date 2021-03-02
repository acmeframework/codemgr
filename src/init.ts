import { LogSeverity } from 'af-utilities';

import { appConfig, copyRepoConfigFiles, TEMPLATE_CHECKS } from './lib/config';
import { initGit, isGitInitialized } from './lib/git';
import { OUTPUT_INCREASE_INDENT, showOutput } from './lib/logging';
import {
  NpmPackage,
  NpmDependencyListsKeys,
  initNpm,
  isNpmInitialized,
  npmPackageInstaller,
  readNpmPackageInfo,
  executeNpmCommand,
} from './lib/npm';

export async function init(): Promise<void> {
  if (appConfig.templateConfig.checks.gitInit || TEMPLATE_CHECKS.gitInit) {
    // Setup Git
    showOutput('Starting Git check');
    showOutput(OUTPUT_INCREASE_INDENT);
    if (!(await isGitInitialized())) {
      if (await initGit()) {
        showOutput('Git initialized');
      } else {
        showOutput({
          message: 'Git could not be initialized',
          exitCode: 1,
          severity: LogSeverity.Error,
        });
      }
    } else {
      showOutput('Git already initialized');
    }
    showOutput({ message: 'Git check complete\n', indentChange: -1 });
  } else {
    showOutput('Git check skipped');
  }

  if (appConfig.templateConfig.checks.npmInit || TEMPLATE_CHECKS.npmInit) {
    // Setup NPM, if needed
    showOutput('Starting NPM initialization...');
    showOutput(OUTPUT_INCREASE_INDENT);
    if (!(await isNpmInitialized())) {
      if (await initNpm()) {
        showOutput('NPM initialized');
      } else {
        showOutput({
          message: 'Setting up NPM failed, exiting.',
          exitCode: 1,
          severity: LogSeverity.Error,
        });
      }
    } else {
      showOutput('NPM already initialized');
    }
    showOutput({ message: 'NPM initialization complete\n', indentChange: -1 });
  } else {
    showOutput('NPM check skipped');
  }

  const npmPackageInfo = new NpmPackage(
    await readNpmPackageInfo(`${appConfig.paths.currentPath}`)
  );

  if (
    appConfig.templateConfig.checks.requiredPackages ||
    TEMPLATE_CHECKS.requiredPackages
  ) {
    // Install the required modules
    showOutput(`Installing standard production/development packages`);

    showOutput(OUTPUT_INCREASE_INDENT);
    for (const key in appConfig.templateConfig.requiredPackages) {
      if (
        Object.prototype.hasOwnProperty.call(
          appConfig.templateConfig.requiredPackages,
          key
        )
      ) {
        showOutput(`Determining ${key} to install`);
        const dependencies: string[] = [];
        const dependencyType = key as NpmDependencyListsKeys;
        showOutput(OUTPUT_INCREASE_INDENT);
        appConfig.templateConfig.requiredPackages[dependencyType].forEach(
          (packageName: string) => {
            const matchValue = npmPackageInfo.isPackageInstalled(
              packageName,
              dependencyType
            );
            if (matchValue === 0) {
              showOutput(`Adding ${packageName} to ${key} install list`);
              dependencies.push(packageName);
            } else {
              if (matchValue === 2) {
                showOutput(
                  `${packageName} already installed - skipping - exact version installed`
                );
              } else {
                showOutput(
                  `${packageName} already installed - skipping - non-exact version match found`
                );
              }
            }
          }
        );
        if (dependencies.length > 0) {
          showOutput(`Installing required ${key} packages`);
          if (!(await npmPackageInstaller(dependencies, dependencyType))) {
            showOutput({
              message: `Failed to install ${dependencies}`,
              exitCode: 1,
              severity: LogSeverity.Error,
            });
          }
        } else {
          showOutput(`No ${key} packages required to be installed`);
        }
        showOutput({ message: `Done with packages`, indentChange: -1 });
      }
    }
    showOutput({
      message: `Done installing production/development packages\n`,
      indentChange: -1,
    });
  } else {
    showOutput('Package check skipped.');
  }

  if (
    appConfig.templateConfig.checks.templateFiles ||
    TEMPLATE_CHECKS.templateFiles
  ) {
    showOutput(`Setting up repository configuration`);
    showOutput({
      message: `Copying default configuration files`,
      indentChange: 1,
    });
    showOutput(OUTPUT_INCREASE_INDENT);
    await copyRepoConfigFiles(appConfig.overwrite, appConfig.backup);
    showOutput({
      message: `Done copying default configuration files`,
      indentChange: -1,
    });
    showOutput({
      message: `Done setting up repository configuration\n`,
      indentChange: -1,
    });
  } else {
    showOutput('Repository configuration checks skipped');
  }

  if (appConfig.templateConfig.checks.scripts || TEMPLATE_CHECKS.scripts) {
    showOutput('Setting up scripts in your package.json');
    showOutput(OUTPUT_INCREASE_INDENT);
    for (const script in appConfig.templateConfig.scripts) {
      if (
        Object.prototype.hasOwnProperty.call(
          appConfig.templateConfig.scripts,
          script
        )
      ) {
        if (!npmPackageInfo.isScriptPresent(script)) {
          const scriptCode = appConfig.templateConfig.scripts[script].replace(
            / /g,
            '\\ '
          );
          if (await executeNpmCommand(`set-script ${script} ${scriptCode}`)) {
            showOutput(`${script} added to NPM package.json`);
          } else {
            showOutput({
              message: `${script} could not be added to NPM package.json`,
              exitCode: 1,
            });
          }
        } else {
          showOutput(`${script} already found in NPM package.json`);
        }
      }
    }
    showOutput({ message: 'Scripts configured', indentChange: -1 });
  } else {
    showOutput('Script configuration checks skipped');
  }
}
