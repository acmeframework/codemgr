import { pathExists } from './file-utils';
import { executeCommand } from './proc-utils';

const GIT_COMMAND = 'git';
const GIT_DIR = '.git';

export async function executeGitCommand(
  cmdArguments: string[]
): Promise<boolean> {
  return Promise.resolve(executeCommand(GIT_COMMAND, cmdArguments));
}

export async function initGit(): Promise<boolean> {
  return Promise.resolve(await executeGitCommand(['init']));
}

export async function isGitInitialized(): Promise<boolean> {
  return await pathExists(GIT_DIR);
}
