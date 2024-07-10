export type ArrayLike<T = string> = T | T[];

export type Pattern = {
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
   * Filter files or directory to copy
   * it can be a string or an array of strings
   * it should be the name of the file or a pattern to match the file name from the source directory
   * example: `['test1.json', '*.txt']`
   */
  filter?: ArrayLike;
  /**
   * Watch for changes in the source directory
   * when a file is added or changed, copy or change the file to the destination directory
   * It only work when the main watch option is set to true and esbuild's watch mode is used (ctx.watch())
   * @default false
   */
  watch?: boolean;
};

export type Options = {
  /**
   * The list of assets to copy
   */
  patterns: Pattern[];
  /**
   * Manually top watching for changes in the source directory
   * @default false
   */
  stopWatching?: boolean;
  /**
   * Watch for changes in the source directory
   * When setting to true, make sure using esbuild's watch mode (ctx.watch())
   * @default false
   */
  watch?: boolean;
};

