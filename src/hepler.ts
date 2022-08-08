import { hasDuplicated } from "./collection";
import deepEqual from "deep-equal";
import type { Row_t, cellSymbols, internalSymbols } from "./types";

export const getOutputFromArray = (
  headers: Row_t,
  row: Row_t,
  symbol: cellSymbols & internalSymbols & { out: Symbol }
) => {
  let result: unknown = symbol.undefined;
  for (const [index, cellValue] of row.entries()) {
    if (cellValue === symbol.any || cellValue === symbol.otherwise) continue;
    if (headers[index] === symbol.out) {
      result = cellValue;
      continue;
    }
    if (!deepEqual(headers[index], cellValue)) {
      // Not matched this row.
      return symbol.undefined;
    }
  }
  return result;
};

export const hasDuplicatedRowExcept = (rows: Row_t[], exceptIndex: number) => {
  const conditions = rows.map((row) =>
    row.filter((_, index) => index !== exceptIndex)
  );
  return hasDuplicated(conditions);
};

export const splitConditionsOtherwise = (
  rows: Row_t[],
  symbols: cellSymbols
) => {
  const normal = rows.filter((row) => !row.includes(symbols.otherwise));
  const otherwise = rows.filter((row) => row.includes(symbols.otherwise));
  return [normal, otherwise];
};

export const isCalledAsTagged = (
  strings: TemplateStringsArray,
  vars: unknown[]
) => {
  if (!strings) return false;
  if (!strings.raw) return false;
  return [
    strings.length > 0,
    strings.raw.length === strings.length,
    Object.isFrozen(strings),
    vars.length + 1 === strings.length,
  ].every((condition) => condition === true);
};
