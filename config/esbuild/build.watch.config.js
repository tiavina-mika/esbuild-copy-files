const esbuild = require('esbuild');
const { buildOptions } = require('./build.config');

async function watch() {
  const ctx = await esbuild.context(buildOptions);

  ctx.watch();
  console.log('[main] esbuild watching for changes...');
}
watch();
