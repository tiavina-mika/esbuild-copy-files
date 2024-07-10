import { Plugin } from "esbuild";
import chokidar from "chokidar";

import { Options } from "./types";
import { copyFiles, copyFilesOnChange, ensureArray } from "./utils";

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
        build.onEnd(async () => {
          try {
            for (const pattern of patterns) {
              const { from = [], to = [], filter = [], watch: patternWatch } = pattern;
              for (const source of ensureArray(from)) {
                await copyFiles({ to, source, filter });
                
                // watch for changes in the source directory
                if (watch && patternWatch) {
                  const watcher = chokidar.watch(source, {
                    disableGlobbing: false,
                    usePolling: true,
                    interval: 200,
                    ignorePermissionErrors: true,
                  });
                  
                  // copy files when a file is added or changed
                  watcher.on('change', copyFilesOnChange({ to, source, filter }));
                  // copy files when a file is added
                  watcher.on('add', copyFilesOnChange({ to, source, filter }));

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
