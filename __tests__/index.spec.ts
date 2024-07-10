// import {describe, expect, test} from '@jest/globals';

import esbuild, { BuildContext, BuildOptions } from "esbuild";
import fs from 'fs-extra';
import { Options } from "../src/types";
import path from "path";
import { copy } from "../src/index";
import { ensureArray } from "../src/utils";

const wait = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

const sourceDir = path.resolve(__dirname, './src');
const destDir = path.resolve(__dirname, './dist');

const newFile = 'test2 copy.json';
let context: BuildContext | null = null;

const getBuilderOptions = (
  esbuildOptions: BuildOptions | null = { outdir: destDir }
) => ({
  entryPoints: [path.resolve(sourceDir, 'index.ts')],
  absWorkingDir: sourceDir,
  outfile: esbuildOptions?.outdir ? undefined : esbuildOptions?.outfile,
  ...(esbuildOptions ?? {}),
});

/**
 * create esbuild builder with copy plugin
 * @param options 
 * @param esbuildOptions 
 */
const builder = async (
  options?: Partial<Options>,
  esbuildOptions: BuildOptions | null = { outdir: destDir }
): Promise<void> => {
  await esbuild.build({
    ...getBuilderOptions(esbuildOptions),
    plugins: [copy(options as Options)],
  });
};

/**
 * create esbuild builder with copy plugin and watch mode
 * @param options 
 * @param esbuildOptions 
 * @returns 
 */
const watchedBuilder = async (
  options?: Partial<Options>,
  esbuildOptions: BuildOptions | null = { outdir: destDir }
): Promise<BuildContext> => {
    const ctx = await esbuild.context({
      ...getBuilderOptions(esbuildOptions),
      plugins: [copy({ ...options, stopWatching: true } as Options)],
    });
    await ctx.watch();
    return ctx;
};

beforeEach(async () => {
  await fs.remove(destDir);
});

afterEach(async () => {
  await fs.remove(destDir);
  // remove the newly created file to the source directory if exists
  await fs.remove(`${sourceDir}/folder1/subfolder1/${newFile}`)

  // should close the context after each test
  if (context) {
    await (context as BuildContext).dispose();
    context = null;
  }
});

describe('esbuild-copy-files', () => {
  describe('copy files', () => {
    test('should copy all files in directories', async () => {
      await builder(
        {
          patterns: [
            {
              from: [`${sourceDir}/folder1/subfolder1`],
              to: [`${destDir}/folder1/subfolder1`],
            }
          ]
        },
      );
  
      const files = fs.readdirSync(path.join(destDir, '/folder1/subfolder1'));
      expect(files).toEqual(['test1.json', 'test2.json']);
    });
  
    test('should copy one file', async () => {
      await builder(
        {
          patterns: [
            {
              from: [`${sourceDir}/folder1/subfolder1`],
              to: [`${destDir}/folder1/subfolder1`],
              filter: ['test1.json'],
            }
          ]
        },
      );
  
      const files = fs.readdirSync(path.join(destDir, '/folder1/subfolder1'));
      expect(files).toEqual(['test1.json']);
      expect(files.includes('test2.json')).toBe(false);
    });

    test('should copy one folder', async () => {
      await builder(
        {
          patterns: [
            {
              from: [`${sourceDir}/folder3`],
              to: [`${destDir}/folder3`],
              filter: ['subfolder3'],
            }
          ]
        },
      );
  
      const files = fs.readdirSync(path.join(destDir, '/folder3'));
      expect(files).toEqual(['subfolder3']);
      expect(files.includes('test7.txt')).toBe(false);
    });
  
    test('should copy files with a same extension', async () => {
      await builder(
        {
          patterns: [
            {
              from: [`${sourceDir}/folder2`],
              to: [`${destDir}/folder2`],
              filter: ['*.txt'], // filter all txt files
            }
          ]
        },
      );
  
      const files = fs.readdirSync(path.join(destDir, '/folder2'));
      expect(files).toEqual(['test4.txt', 'test5.txt']);
    });
  
    test('should copy all files to destination folders respectively', async () => {
      await builder(
        {
          patterns: [
            {
              from: [`${sourceDir}/folder1/subfolder1`],
              to: [`${destDir}/folder1/subfolder1`],
            },
            {
              from: [`${sourceDir}/folder2`],
              to: [`${destDir}/folder2/subfolder2`],
            }
          ]
        },
      );
  
      const files1 = fs.readdirSync(path.join(destDir, '/folder1/subfolder1'));
      expect(files1).toEqual(['test1.json', 'test2.json']);
  
      const files2 = fs.readdirSync(path.join(destDir, '/folder2/subfolder2'));
      expect(files2).toEqual(['test3.json', 'test4.txt', 'test5.txt']);
    });
  
    test('should copy files to a new directory', async () => {
      await builder(
        {
          patterns: [
            {
              from: [`${sourceDir}/folder1/subfolder1`, `${sourceDir}/folder2`],
              to: [`${destDir}/folder3/subfolder3`],
            }
          ]
        },
      );
  
      const files = fs.readdirSync(path.join(destDir, '/folder3/subfolder3'));
      expect(files).toEqual(['test1.json', 'test2.json', 'test3.json', 'test4.txt', 'test5.txt']);
    });
  
    test('should copy files and folders', async () => {
      await builder(
        {
          patterns: [
            {
              from: [`${sourceDir}/folder3`],
              to: [`${destDir}/folder3`],
            }
          ]
        },
      );
  
      const files: string[] = [];
      const dirs: string[] = [];
      const dirEntries = await fs.readdir(`${sourceDir}/folder3`, { withFileTypes: true });
      for (const entry of dirEntries) {
        if (entry.isFile()) {
          files.push(entry.name);
        } else {
          dirs.push(entry.name);
        }
      }

      expect(files).toEqual(['test7.txt']);
      expect(dirs).toEqual(['subfolder3']);
      // check if the subfolder3 and its files are copied
      const subFiles1 = fs.readdirSync(path.join(destDir, '/folder3/subfolder3'));
      expect(subFiles1).toEqual(['test6.json']);
    });
  });
  
  describe('copy files on change', () => {
    test('should copy new created file', async () => {
      context = await watchedBuilder(
        {
          patterns: [
            {
              from: [`${sourceDir}/folder1/subfolder1`],
              to: [`${destDir}/folder1/subfolder1`],
              watch: true,
            }
          ],
          stopWatching: true,
          watch: true,
        },
      );

      // 1. create a file in the source directory
      await fs.ensureFile(path.join(sourceDir, '/folder1/subfolder1/', newFile));
  
      // 2. list all files in the source directory
      const filesInSource = fs.readdirSync(path.join(sourceDir, '/folder1/subfolder1'));
      await wait(1000);
      expect(filesInSource.includes(newFile)).toBe(true);
      await wait(1000);

      // 3. list all files in the destination directory
      const files = fs.readdirSync(path.join(destDir, '/folder1/subfolder1'));
      await wait(1000);

      // check if the new file is copied
      expect(files.includes(newFile)).toBe(true);
    });

    test('should updated copied file when source change', async () => {
      context = await watchedBuilder(
        {
          patterns: [
            {
              from: [`${sourceDir}/folder1/subfolder1`],
              to: [`${destDir}/folder1/subfolder1`],
              watch: true,
            }
          ],
          stopWatching: true,
          watch: true,
        },
      );

      // 1. create a file in the source directory
      await fs.ensureFile(path.join(sourceDir, '/folder1/subfolder1/', newFile));
  
      // 2. list all files in the source directory
      const filesInSource = fs.readdirSync(path.join(sourceDir, '/folder1/subfolder1'));
      await wait(1000);
      expect(filesInSource.includes(newFile)).toBe(true);
      await wait(1000);

      // 3. write content to the new file
      const newSourceFilePath = path.join(sourceDir, `/folder1/subfolder1/${newFile}`);
      await fs.writeJson(newSourceFilePath, { name: 'John Doe' });

      // 4. write content to the new file
      const newSourceFileContent = await fs.readJson(newSourceFilePath);
      expect(newSourceFileContent.name).toEqual('John Doe');

      // 5. list all files in the destination directory
      const files = fs.readdirSync(path.join(destDir, '/folder1/subfolder1'));
      await wait(1000);

      // 6. check if the new file is copied and updated
      const newDestFilePath = path.join(destDir, `/folder1/subfolder1/${newFile}`);
      await fs.writeJson(newDestFilePath, { name: 'John Doe' })
      const newDestFileContent = await fs.readJson(newDestFilePath);
      expect(newDestFileContent.name).toEqual('John Doe');

      // check if the new file is copied
      expect(files.includes(newFile)).toBe(true);
    });
  });

  describe('check utility functions', () => {
    test('should be an array string', async () => {
      const array = ensureArray('test');
      expect(array).toEqual(['test']);
    });
  });
});
