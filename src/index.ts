import { splitArrayAsNLength } from "./collection";
import type {
  conditionsRow,
  headerRow,
  cellSymbols,
  internalSymbols,
} from "./types";
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

  #getOutputFromArray(headers: headerRow, row: conditionsRow) {
    const symbols = { ...this.cell, ...this.internals, out: this.out };
    return getOutputFromArray(headers, row, symbols);
  }

  #hasDuplicatedConditions(rows: conditionsRow[], outputIndex: number) {
    return hasDuplicatedRowExcept(rows, outputIndex);
  }

  eval(strings: TemplateStringsArray, ...vars: unknown[]) {
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
    const headers = splitted[0] as headerRow;
    const rows = splitted.splice(1) as conditionsRow[];

    if (this.#hasDuplicatedConditions(rows, columnIndex)) {
      throw TRExceptions.duplicatedConditionError;
    }

    const matched = [] as Array<{ row: conditionsRow; output: unknown }>;
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
