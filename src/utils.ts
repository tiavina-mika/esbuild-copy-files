import path from 'path';
import fs from 'fs-extra';
import anymatch from 'anymatch';
import { ArrayLike } from './types';

type CopyActionsInput = {
  to: ArrayLike<string>;
  ignoreFiles: ArrayLike<string>;
  source: string;
};

/**
 * ensure the value is an array
 * @param value 
 * @returns 
 */
export const ensureArray = <T>(value: ArrayLike<T>): T[] => Array.isArray(value) ? value : [value];

const forceCopy = async (sourcePath: string, destPath: string) => {
  try {
    await fs.copy(sourcePath, destPath);
  } catch (error) {
    if ((error as any).code === 'ENOENT') { // no such file or directory. File really does not exist
      return false;
    }
  }
};

/**
 * copy files from source to destination
 * @param param0 
 * @returns 
 */
export const copyFiles = async ({ to = [], ignoreFiles = [], source }: CopyActionsInput) => {
  if (!source) return;

  // get the current working directory
  const currentRoot = process.cwd();
  const sourcePath = path.resolve(currentRoot, source);

  for (const dest of ensureArray(ensureArray(to))) {
    const destPath = path.resolve(currentRoot, dest);
    // ensure the destination directory exists
    await fs.ensureDir(destPath);
    // copy the source directory to the destination directory
    await forceCopy(sourcePath, destPath);

    // list all files in the source directory
    const dirEntries = await fs.readdir(sourcePath, { withFileTypes: true });

    // remove files that match the ignoreFiles pattern in the destination directory
    for (const entry of dirEntries) {
      const match = anymatch(ensureArray(ignoreFiles), entry.name)
      if (entry.isFile() && match) {
        await fs.remove(destPath + '/' + entry.name);
      }
    }
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
