import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { LogSeverity } from 'af-utilities';

import { showOutput } from './logging';

const copyFilep = promisify(fs.copyFile);
const mkdirp = promisify(fs.mkdir);
const readDirp = promisify(fs.readdir);
const readFilep = promisify(fs.readFile);

export async function copyFile(
  src: string,
  dst: string,
  overwrite = true,
  backup = false
): Promise<number> {
  try {
    let flags = 0;
    if (!overwrite || backup) {
      flags = fs.constants.COPYFILE_EXCL;
    }
    await copyFilep(src, dst, flags);
    return 1;
  } catch (err) {
    if (!overwrite && err.code === 'EEXIST') {
      return 0;
    }
    if (backup) {
      // We will make a backup copy in our destination. If a backup already
      // exists we will overwrite it.
      if ((await copyFile(dst, `${dst}.bak`, true)) === 1) {
        // Try one last time.
        return copyFile(src, dst, true);
      } else {
        showOutput({
          message: `copyFile failed making a backup`,
          severity: LogSeverity.Error,
        });
      }
    }
    showOutput({
      message: `copyFile failed - ${err}`,
      severity: LogSeverity.Error,
    });
    return -1;
  }
}

type FileList = fs.Dirent[];

async function readDir(src: string): Promise<FileList> {
  const fileList = await readDirp(src, { withFileTypes: true });
  return fileList;
}

export async function copyFiles(
  src: string,
  dst: string,
  overwrite = true,
  mode = 0o777,
  backup = false
): Promise<boolean> {
  try {
    const files = await readDir(src);
    for (const entity of files) {
      const srcPath = path.join(src, entity.name);
      const dstPath = path.join(dst, entity.name);
      if (entity.isFile()) {
        if ((await copyFile(srcPath, dstPath, overwrite, backup)) < 0) {
          return false;
        }
      } else if (entity.isDirectory()) {
        // We don't care about the result...
        await mkdir(dstPath, true, mode);
        if (!(await copyFiles(srcPath, dstPath, overwrite, mode, backup))) {
          return false;
        }
      }
    }
    return true;
  } catch (err) {
    showOutput({
      message: `Copy of files to ${dst} failed.\n${err}`,
      severity: LogSeverity.Error,
    });
    return false;
  }
}

export async function mkdir(
  pathToCreate: string,
  recursive = false,
  mode = 0o777
): Promise<boolean> {
  try {
    const output = await mkdirp(pathToCreate, {
      recursive: recursive,
      mode: mode,
    });
    showOutput({
      message: `mkdirSync - ${output}`,
      severity: LogSeverity.Debug,
    });
    return Promise.resolve(true);
  } catch (err) {
    showOutput({ message: `mkdirSync - ${err}`, severity: LogSeverity.Error });
    return Promise.resolve(false);
  }
}

export async function fileExists(file: string): Promise<boolean> {
  return Promise.resolve(fs.existsSync(file));
}

export async function pathExists(path: string): Promise<boolean> {
  return await fileExists(path);
}

export async function readFile(path: string): Promise<string> {
  return await readFilep(path, 'utf-8');
}

export async function readJSONFile<T>(path: string): Promise<T> {
  const readData = await readFile(path);
  return JSON.parse(readData);
}
