import { splitArrayAsNLength } from "./collection";
import type { Row_t, cellSymbols, internalSymbols } from "./types";
import { TRExceptions } from "./exception";
import {
  getOutputFromArray,
  hasDuplicatedRowExcept,
  splitConditionsOtherwise,
  isCalledAsTagged,
} from "./hepler";

export class ThinRichTable {
  public out: Symbol;
  public cell: cellSymbols;
  public internals: internalSymbols;

  constructor() {
    this.out = Symbol("out");
    this.cell = {
      any: Symbol("any"),
      otherwise: Symbol("otherwise"),
    };
    this.internals = {
      undefined: Symbol("undefined"),
    };
  }

  #getOutputFromArray(headers: Row_t, row: Row_t) {
    const symbols = { ...this.cell, ...this.internals, out: this.out };
    return getOutputFromArray(headers, row, symbols);
  }

  #hasDuplicatedConditions(rows: Row_t[], outputIndex: number) {
    return hasDuplicatedRowExcept(rows, outputIndex);
  }

  eval(strings: TemplateStringsArray, ...vars: Row_t) {
    if (!isCalledAsTagged(strings, vars)) {
      throw TRExceptions.notCalledAsTaggedError;
    }

    const outputColumns = vars.filter((variable) => variable === this.out);
    if (outputColumns.length > 1) {
      throw TRExceptions.duplicatedOutputError;
    } else if (outputColumns.length < 1) {
      throw TRExceptions.notDefinedOutputError;
    }

    // `this.out` needs to be defined on the end of table header.
    const columnIndex = vars.indexOf(this.out);
    const columnCount = columnIndex + 1;
    if (vars.length % columnCount !== 0) {
      throw TRExceptions.notMatchedColumnCountError;
    }

    const splitted = splitArrayAsNLength(vars, columnCount);
    const headers = splitted[0];
    const rows = splitted.splice(1);

    if (this.#hasDuplicatedConditions(rows, columnIndex)) {
      throw TRExceptions.duplicatedConditionError;
    }

    const matched = [] as Array<{ row: unknown[]; output: unknown }>;
    const [normalRows, otherwiseRows] = splitConditionsOtherwise(rows, {
      ...this.cell,
    });
    for (const rows of [normalRows, otherwiseRows]) {
      for (const row of rows) {
        const output = this.#getOutputFromArray(headers, row);
        if (output === this.internals.undefined) continue;
        matched.push({ row, output });
      }

      if (matched.length === 1) {
        return matched[0].output;
      } else if (matched.length > 1) {
        throw TRExceptions.duplicatedConditionError;
      }
    }

    throw TRExceptions.notCoveredConditionError;
  }
}
