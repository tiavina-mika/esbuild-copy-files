export type ArrayLike<T = string> = T | T[];

export type Asset = {
  from?: ArrayLike;
  to?: ArrayLike;
  ignoreFiles?: ArrayLike;
  watch?: boolean;
};

export type Options = {
  assets: Asset[];
};


type CopyActionsInput = {
  to: ArrayLike<string>;
  ignoreFiles: ArrayLike<string>;
  source: string;
};
