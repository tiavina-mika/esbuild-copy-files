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

type CopyActionsInput = {
  to: ArrayLike<string>;
  ignoreFiles: ArrayLike<string>;
  source: string;
};
