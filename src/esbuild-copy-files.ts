import { Plugin } from "esbuild";
import chokidar from "chokidar";

import { Options } from "./types";
import { copyFiles, copyFilesOnChange, ensureArray } from "./utils";

const copy = ({ assets = [] }: Options) => ({
    name: 'esbuild-copy-files',
    setup: (build) => {
        build.onEnd(async () => {
          try {
            for (const asset of assets) {
              const { from = [], to = [], ignoreFiles = [], watch } = asset;
              for (const source of ensureArray(from)) {
                await copyFiles({ to, source, ignoreFiles });
                
                if (watch) {
                  const watcher = chokidar.watch(source, {
                    disableGlobbing: false,
                    usePolling: true,
                    interval: 200,
                    ignorePermissionErrors: true,
                  });
                  
                  watcher.on('change', copyFilesOnChange({ to, source, ignoreFiles }));
                  watcher.on('add', copyFilesOnChange({ to, source, ignoreFiles }));
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
