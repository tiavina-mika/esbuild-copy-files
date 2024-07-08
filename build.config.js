const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs-extra');
const { nodeExternalsPlugin } = require("esbuild-node-externals");

const esbuildCopyTypesPlugin = () => ({
  name: 'esbuild-copy-plugin',
  setup(build) {
      build.onEnd(async () => {
        try {
          const currentRoot = process.cwd();
          const typesPath = path.resolve(currentRoot, './src/types.d.ts');
          const destPath = path.resolve(currentRoot, './dist/types.d.ts');
          await fs.copy(typesPath, destPath);
        } catch (e) {
            console.error('Failed to copy file:', e);
        }
      });
  },
});

const buildOptions = {
  entryPoints: [
    { in: path.resolve(__dirname, './src/index.ts'), out: path.resolve(__dirname, './dist/index') },
  ],
  // see: https://stackoverflow.com/questions/71837664/does-esbuild-provide-a-feature-like-the-resolve-alias-option-in-webpack
  bundle: true,
  platform: 'node',
  outdir: 'dist',
  plugins: [
    nodeExternalsPlugin(),
    esbuildCopyTypesPlugin()
  ],
};

exports.buildOptions = buildOptions;

async function build() {
  await esbuild.build(buildOptions);
}
build();
