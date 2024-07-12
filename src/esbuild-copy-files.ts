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
        // on build end
        build.onEnd(async () => {
          try {
            for (const pattern of patterns) {
              const { from = [], to = [], ignore = [], watch: patternWatch } = pattern;

              for (const source of ensureArray(from)) {
                await copyFiles({ to, source, ignore });
                
                // watch for changes in the source directory
                if (watch && patternWatch) {
                  const watcher = chokidar.watch(source, {
                    disableGlobbing: false,
                    usePolling: true,
                    interval: 200,
                    ignorePermissionErrors: true,
                  });
                  
                  // copy files when a file is added or changed
                  watcher.on('change', copyFilesOnChange({ to, source, ignore }));
                  // copy files when a file is added
                  watcher.on('add', copyFilesOnChange({ to, source, ignore }));

                  // stop watching for changes in the source directory
                  if (stopWatching) {
                    await watcher.close();
                  }
                }
              }
            }
          } catch (error) {
            // It usually happens when the folder is opened in the terminal, after stopping the terminal i was able to delete the folder.
            // see: https://stackoverflow.com/questions/55212864/error-ebusy-resource-busy-or-locked-rmdir
            if ((error as any).code === 'EBUSY') {
              return;
            }
            console.error(error);
          }
        });
    },
} satisfies Plugin);

export default copy;
