export type conditionsRow = unknown[] & { readonly __tag: unique symbol };
export type headerRow = unknown[] & { readonly __tag: unique symbol };

export type cellKeys = "any" | "otherwise";
export type cellSymbols = { [key in cellKeys]: Symbol };

export type internalKey = "undefined";
export type internalSymbols = { [key in internalKey]: Symbol };
