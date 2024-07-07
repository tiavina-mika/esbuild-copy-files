const path = require('path');
const fs = require('fs-extra')
const wait = require('util').promisify(setTimeout);
const crypto = require("crypto");

const uuid = crypto.randomUUID();

const esbuildCopyPlugin = () => ({
    name: 'esbuild-copy-plugin',
    setup(build) {
        build.onEnd(async () => {
            try {
                const temp = path.resolve(__dirname, `../../dist/${uuid}`);
                const enDirs = path.resolve(__dirname, '../../dist/locales/en');
                // const enDirs = path.resolve(__dirname, '../../dist/locales/en');
                await fs.mkdir(temp)
                // await fs.ensureDir(enDirs)
                const source = '../../src/locales/en/common.json';
                const destination = '../../dist/locales/en/common.json';

                await fs.copy(source, temp);
                await fs.move(tmp, destination, {overwrite: true});
                // await fs.copy('../../src/locales/en/common.json', '../../dist/locales/en/common.json');
            } catch (e) {
                console.error('Failed to copy file:', e);
            }
        });
    },
});

exports.esbuildCopyPlugin = esbuildCopyPlugin;
