import { Plugin } from "esbuild";
import chokidar from "chokidar";

import { Options } from "./types";
import { copyFiles, copyFilesOnChange, ensureArray, getNewAddedFiles, getOriginalSourceFilenames } from "./utils";
import fs from "fs-extra";
import path from "path";

/**
  * 
  * copy files from the source directory to the destination directory
  * 
  * @param patterns The list of assets to copy
  * @param stopWatching Manually top watching for changes in the source directory
  * @param watch Watch for changes in the source directory
  * @returns 
*/
const copy = ({ patterns = [], stopWatching = false, watch = false }: Options) => ({
    name: 'esbuild-copy-files',
    setup: (build) => {
        let originalSources: string[] = [];
        // on build start
        build.onStart(async () => {
          // the original source files before the build
          // this is used to compare with the current source files after the build
          // to get the new added files
          originalSources = await getOriginalSourceFilenames(patterns);
        });
        // on build end
        build.onEnd(async () => {
          try {
            for (const pattern of patterns) {
              const { from = [], to = [], filter = ['*'], watch: patternWatch } = pattern;
              const fromArr = ensureArray(from);
              const newAddFiles = await getNewAddedFiles(originalSources, fromArr);
              console.log("🚀 ~ build.onEnd ~ newAddFiles:", newAddFiles)

              for (const source of fromArr) {
                const filterWithNewAddedFiles = [...filter, ...newAddFiles];
                await copyFiles({ to, source, filter: filterWithNewAddedFiles });
                
                // watch for changes in the source directory
                if (watch && patternWatch) {
                  const watcher = chokidar.watch(source, {
                    disableGlobbing: false,
                    usePolling: true,
                    interval: 200,
                    ignorePermissionErrors: true,
                  });
                  
                  // copy files when a file is added or changed
                  watcher.on('change', copyFilesOnChange({ to, source, filter: filterWithNewAddedFiles }));
                  // copy files when a file is added
                  watcher.on('add', copyFilesOnChange({ to, source, filter: filterWithNewAddedFiles }));

                  // stop watching for changes in the source directory
                  if (stopWatching) {
                    await watcher.close();
                  }
                }
              }
            }
          } catch (e) {
              console.error('Failed to copy file:', e);
          }
        });
    },
} satisfies Plugin);

export default copy;
