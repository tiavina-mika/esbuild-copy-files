const esbuild = require('esbuild');
const path = require('path');
const { nodeExternalsPlugin } = require('esbuild-node-externals');
const { copy } = require('esbuild-plugin-copy');
const fs = require('fs');
const wait = require('util').promisify(setTimeout);

const copyManifestPlugin = () => ({
    name: 'copy-manifest-plugin',
    setup(build) {
        console.log("🚀 ~ setup ~ build:", build)
        build.onEnd(async () => {
            try {
              const enDirs = path.resolve(__dirname, '../../dist/locales/en');
              if (!fs.existsSync(enDirs)){
                fs.mkdirSync(enDirs, { recursive: true });
	              await wait(1000);
              }
              fs.copyFileSync(path.resolve(__dirname, '../../src/locales/en/common.json'), path.resolve(__dirname, '../../dist/locales/en/common.json'));
            } catch (e) {
                console.error('Failed to copy file:', e);
            }
        });
    },
});

const buildOptions = {
  // entryPoints: [path.resolve(__dirname, '../../src/index.ts'), path.resolve(__dirname, '../../src/cloud/index.ts')],
  entryPoints: [
    { in: path.resolve(__dirname, '../../src/index.ts'), out: path.resolve(__dirname, '../../dist/index') },
    { in: path.resolve(__dirname, '../../src/cloud/index.ts'), out: path.resolve(__dirname, '../../dist/cloud/index') },
  ],
  // see: https://stackoverflow.com/questions/71837664/does-esbuild-provide-a-feature-like-the-resolve-alias-option-in-webpack
  bundle: true,
  platform: 'node',
  outdir: 'dist',
  sourcemap: true,
  plugins: [
    // copy({
    //   // this is equal to process.cwd(), which means we use cwd path as base path to resolve `to` path
    //   // if not specified, this plugin uses ESBuild.build outdir/outfile options as base path.
    //   // resolveFrom: 'cwd',
    //   // resolveFrom: 'dist',
    //   assets: [
    //     {
    //       from: [`${path.join(path.resolve(__dirname, '../../src'), 'locales')}/*`],
    //       to: ['./locales/en'],
    //     }
    //   ],
    //   // watch: true,
    // }),
    copyManifestPlugin(),
    nodeExternalsPlugin(),
  ],
};

exports.buildOptions = buildOptions;

async function build() {
  // console.log("🚀 ~ build ~ buildOptions:",  `${path.join(path.resolve(__dirname, '../../src'), 'locales')}/*`)

  esbuild.build(buildOptions);
}
build();
