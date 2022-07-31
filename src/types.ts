export type Row_t = unknown[];

export type cellKeys = "any" | "otherwise";
export type cellSymbols = { [key in cellKeys]: Symbol };

export type internalKey = "undefined";
export type internalSymbols = { [key in internalKey]: Symbol };
