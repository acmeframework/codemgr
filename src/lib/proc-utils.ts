import * as path from 'path';
import * as os from 'os';

import { LogSeverity } from 'af-utilities';
import * as execa from 'execa';

import { showOutput } from './logging';

export const USER_HOME_PATH: Readonly<string> = os.homedir();
export const CURRENT_PATH: Readonly<string> = process.cwd();
export const SCRIPT_PATH: Readonly<string> = path.resolve(__dirname, '..');

const DEFAULT_COMMAND_TIMEOUT: Readonly<number> = 120000;

export async function executeCommandWithOutput(
  command: string,
  workingPath = CURRENT_PATH,
  timeout = DEFAULT_COMMAND_TIMEOUT
): Promise<string> {
  const output: execa.ExecaReturnValue = await execa.command(command, {
    localDir: workingPath,
    timeout: timeout,
  });
  showOutput({
    message: `Command Result: \n${output}`,
    severity: LogSeverity.Debug,
  });
  return output.stdout;
}

export async function executeCommand(
  command: string,
  workingPath?: string,
  timeout?: number
): Promise<boolean> {
  try {
    await executeCommandWithOutput(command, workingPath, timeout);
    return true;
  } catch (err) {
    showOutput({ message: `ERROR\n${err}`, severity: LogSeverity.Error });
    return false;
  }
}
