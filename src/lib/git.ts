import { pathExists } from './file-utils';
import { executeCommand } from './proc-utils';

const GIT_COMMAND = 'git';
const GIT_DIR = '.git';

export async function executeGitCommand(command: string): Promise<boolean> {
  return Promise.resolve(executeCommand(`${GIT_COMMAND} ${command}`));
}

export async function initGit(): Promise<boolean> {
  return Promise.resolve(await executeGitCommand('init'));
}

export async function isGitInitialized(): Promise<boolean> {
  return await pathExists(GIT_DIR);
}
