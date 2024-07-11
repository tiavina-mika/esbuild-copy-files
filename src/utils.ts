import path from 'path';
import fs from 'fs-extra';
import anymatch from 'anymatch';
import { ArrayLike, Pattern } from './types';

type CopyActionsInput = {
  to: ArrayLike<string>;
  ignore: ArrayLike<string>;
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
 * 
 * copy files from the source directory to the destination directory
 * list of destination directories
 * @param to
 * the source directory or file to copy from
 * @param source
 * the source directories or files to copy
 * @param ignore 
 * @returns 
 */
export const copyFiles = async ({ to = [], ignore = [], source }: CopyActionsInput): Promise<void | undefined> => {
  if (!source) return;

  // get the current working directory
  const currentRoot = process.cwd();
  const sourcePath = path.resolve(currentRoot, source);

  for (const dest of ensureArray(to)) {
    const destPath = path.resolve(currentRoot, dest);
    // ensure the destination directory exists
    await fs.ensureDir(destPath);
    // copy the source directory to the destination directory
    await forceCopy(sourcePath, destPath);

    // list all files in the source directory
    const dirEntries = await fs.readdir(sourcePath, { withFileTypes: true });

    const ignoreArray = ensureArray(ignore);

    // if no ignore is provided, copy all files
    if (!ignoreArray.length) return;

    // remove files that does not match the ignore pattern in the destination directory
    for (const entry of dirEntries) {
      const match = anymatch(ignoreArray, entry.name)
      if (match) {
        if (entry.isDirectory() || entry.isFile()) {
          await fs.remove(destPath + '/' + entry.name);
        }
      }
    }
  }
}

/**
 * 
 * copy files from the source directory to the destination directory on change
 * 
 * list of destination directories
 * @param to
 * the source directory or file to copy from
 * @param source
 * the source directories or files to copy
 * @param ignore 
 * @returns 
 */
export const copyFilesOnChange = ({ to = [], source, ignore }: CopyActionsInput) => async (watchedFilePath: string): Promise<void | undefined> => {
  try {
    const fileName = path.basename(watchedFilePath);

    // if no ignore is provided, copy all files
    if (!ensureArray(ignore).length) {
      await copyFiles({ to, source, ignore });
      return;
    };

    // copy the file if it matches the ignore pattern
    const ignoreMatch = anymatch(ensureArray(ignore), fileName);
    if (!ignoreMatch) {
      await copyFiles({ to, source, ignore });
    }
  } catch (e) {
    console.error('copyFilesOnChange to copy file error:', e);
  }
}
