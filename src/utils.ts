import path from 'path';
import fs from 'fs-extra';
import crypto from "crypto";
import anymatch from 'anymatch';
import { ArrayLike } from './types';

type CopyActionsInput = {
  to: ArrayLike<string>;
  ignoreFiles: ArrayLike<string>;
  source: string;
};


const uuid = crypto.randomBytes(16).toString("hex");

export const ensureArray = <T>(val: ArrayLike<T>): any[] => Array.isArray(val) ? val : [val];

const forceCopy = async (sourcePath: string, destPath: string) => {
  try {
    await fs.copy(sourcePath, destPath);
  } catch (error) {
    if ((error as any).code === 'ENOENT') { // no such file or directory. File really does not exist
      return false;
    }
  }
};

export const copyFiles = async ({ to = [], ignoreFiles = [], source }: CopyActionsInput) => {
  if (!source) return;

  const currentRoot = process.cwd();
  const sourcePath = path.resolve(currentRoot, source);

  for (const dest of ensureArray(ensureArray(to))) {
    const destPath = path.resolve(currentRoot, dest);
    await fs.ensureDir(destPath);
    const dirEntries = await fs.readdir(sourcePath, { withFileTypes: true });
    const tempDest = destPath + uuid;

    await fs.ensureDir(tempDest);
    await fs.copy(sourcePath, tempDest);

    for (const entry of dirEntries) {
      const match = anymatch(ensureArray(ignoreFiles), entry.name)
      if (entry.isFile() && match) {
        await fs.remove(tempDest + '/' + entry.name);
      }
    }
    await forceCopy(tempDest, destPath);
    await fs.remove(tempDest);
  }
}

export const copyFilesOnChange = ({ to = [], source, ignoreFiles }: CopyActionsInput) => async (watchedFilePath: string) => {
  try {
    const fileName = path.basename(watchedFilePath);
    const ignoreMatch = anymatch(ensureArray(ignoreFiles), fileName);
    if (!ignoreMatch) {
      await copyFiles({ to, source, ignoreFiles });
    }
  
  } catch (e) {
    console.error('copyFilesOnChange to copy file error:', e);
  }
}
