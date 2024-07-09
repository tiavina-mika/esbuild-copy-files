import { Plugin } from "esbuild";
import chokidar from "chokidar";

import { Options } from "./types";
import { copyFiles, copyFilesOnChange, ensureArray } from "./utils";

const copy = ({ assets = [], stopWatching = false }: Options) => ({
    name: 'esbuild-copy-files',
    setup: (build) => {
        build.onEnd(async () => {
          try {
            for (const asset of assets) {
              const { from = [], to = [], ignoreFiles = [], watch } = asset;
              for (const source of ensureArray(from)) {
                await copyFiles({ to, source, ignoreFiles });
                
                // watch for changes in the source directory
                if (watch) {
                  const watcher = chokidar.watch(source, {
                    disableGlobbing: false,
                    usePolling: true,
                    interval: 200,
                    ignorePermissionErrors: true,
                  });
                  
                  // copy files when a file is added or changed
                  watcher.on('change', copyFilesOnChange({ to, source, ignoreFiles }));
                  // copy files when a file is added
                  watcher.on('add', copyFilesOnChange({ to, source, ignoreFiles }));

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
