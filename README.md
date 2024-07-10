# esbuild-copy-files

<p align="left">
An <a href="https://mui.com/material-ui/getting-started/overview/">esbuild</a> plugin to copy static files and folders from a source directory to destination directory</p>

<p>✔ Easy to use</p>
<p>✔ Lightweight</p>
<p>✔ Typed</p>

<br />

![Gif](https://github.com/tiavina-mika/esbuild-copy-files/blob/main/screenshots/example.gif)

## Installation

```shell

npm install --save-dev esbuild-copy-files

```
or
```shell

yarn add --dev esbuild-copy-files
```

## Get started

### Simple usage
```tsx
const esbuild = require('esbuild');
const { copy } = require("esbuild-copy-files");

esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/index.js",
  plugins: [
    copy({
      assets: [
        {
          from: ['./src/folder1/subfolder1'],
          to: ['./dist/folder1/subfolder1'],
        }
      ]
    })
  ],
})
```

```sh
# the structure of the source files
src/
├── folder1/
│   ├── file1.png
│   ├── subfolder1/
│   │   └── file2.json
│   │   └── file3.txt

# the structure of the destination files
dist/
├── folder1/
│   ├── file1.png
│   ├── subfolder1/
│   │   └── file2.json
│   │   └── file3.txt

```


### Ignore files
```tsx
copy({
  assets: [
    {
      from: ['./src/folder1'],
      to: ['./dist/folder1'],
      // copy files other than json
      ignoreFiles: ['*.json']
    }
  ]
})
```

### Watch
<p>Watch files in the source directory for changes or when a new files are created</p>

```tsx
copy({
  assets: [
    {
      from: ['./src/folder1'],
      to: ['./dist/folder1'],
      watch: true
    }
  ]
})
```


### Multiple copy
```tsx
copy({
  assets: [
    {
      from: ['./src/folder1'],
      to: ['./dist/folder3']
    },
    {
      from: ['./src/folder2'],
      to: ['./dist/folder4']
    }
  ]
})
```

```sh
# the structure of the source files
src/
├── folder1/
│   ├── file1.json
├── folder2/
│   ├── file2.json

# the structure of the destination files
dist/
├── folder3/
│   ├── file1.json
├── folder4/
│   ├── file2.json

```

See [`here`](https://github.com/tiavina-mika/esbuild-copy-files-demo/tree/main/example) for more examples that use `esbuild-copy-files`.

## Types
```tsx
export type ArrayLike<T = string> = T | T[];

export type Asset = {
  /**
   * The source directory to copy files from
   * it can be a string or an array of strings
   * it should be a relative path to the current working directory
   * example: `['./src/assets', './public']`
   */
  from?: ArrayLike;
  /**
   * The destination directory to copy files to
   * it can be a string or an array of strings
   * it should be a relative path to the current working directory
   * example: `['./dist/assets', './public']`
   */
  to?: ArrayLike;
  /**
   * The files to ignore when copying files
   * it can be a string or an array of strings
   * it should be the name of the file or a pattern to match the file name from the source directory
   * example: `['test1.json', '*.txt']`
   */
  ignoreFiles?: ArrayLike;
  /**
   * Watch for changes in the source directory
   * when a file is added or changed, copy or change the file to the destination directory
   * @default false
   */
  watch?: boolean;
};

export type Options = {
  /**
   * The list of assets to copy
   */
  assets: Asset[];
  /**
   * Stop watching for changes in the source directory
   * @default false
   */
  stopWatching?: boolean;
};

```

## Contributing

Get started [here](https://github.com/tiavina-mika/esbuild-copy-files/blob/main/CONTRIBUTING.md).
