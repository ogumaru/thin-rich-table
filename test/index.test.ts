import { describe, test, expect } from "@jest/globals";
import { ThinRichTable } from "../src";
import { TRExceptions } from "../src/exception";

describe("単純な実行", () => {
  test("【OK】単一条件", () => {
    const table = new ThinRichTable();

    const result = table.eval`
    | ${[0, 0]} | ${[1, 1]} | ${table.out} |
    | --------- | --------- | ------------ |
    | ${[0, 0]} | ${[1, 1]} | ${1}         |
    `;
    expect(result).toBe(1);
  });

  test("【OK】複数条件", () => {
    const A = true;
    const B = false;
    const table = new ThinRichTable();

    const result = table.eval`
    | conditions        | signal: ${A} | signal: ${B} | out: ${table.out} |
    | ----------------- | ------------ | ------------ | ----------------- |
    | all true          | ${true}      | ${true}      | ${1}              |
    | A: true, B: false | ${true}      | ${false}     | ${2}              |
    | A: false, B: true | ${false}     | ${true}      | ${3}              |
    | all false         | ${false}     | ${false}     | ${4}              |
    `;
    expect(result).toBe(2);
  });

  test("【OK】プリミティブでない条件比較", () => {
    const A = [0, 0];
    const B = [1, 1];
    const table = new ThinRichTable();

    const result = table.eval`
    | signal: ${A} | signal: ${B}       | out: ${table.out} |
    | ------------ | ------------------ | ----------------- |
    | ${[0, 1]}    | ${table.cell.any} | ${0}               |
    | ${[0, 0]}    | ${table.cell.any} | ${[0, 1]}          |
    `;
    expect(result).toStrictEqual([0, 1]);
  });

  test("【NG】条件に一致しない", () => {
    const A = true;
    const B = false;
    const table = new ThinRichTable();

    const getResult = () => table.eval`
    | conditions        | signal: ${A} | signal: ${B} | out: ${table.out} |
    | ----------------- | ------------ | ------------ | ----------------- |
    | all true          | ${true}      | ${true}      | ${1}              |
    | A: false, B: true | ${false}     | ${true}      | ${3}              |
    | all false         | ${false}     | ${false}     | ${4}              |
    `;
    expect(getResult).toThrowError(TRExceptions.notCoveredConditionError);
  });
});

describe("呼び出し方法", () => {
  test("【NG】通常の関数として呼び出し", () => {
    const table = new ThinRichTable();

    const getResult = () =>
      table.eval(
        // @ts-ignore
        [true, true, table.out],
        [[true, true, "output"]]
      );
    expect(getResult).toThrowError(TRExceptions.notCalledAsTaggedError);
  });

  test("【NG】通常の関数として不正な引数で呼び出し", () => {
    const table = new ThinRichTable();

    const getResult = () =>
      table.eval(
        // @ts-ignore
        undefined,
        undefined
      );
    expect(getResult).toThrowError(TRExceptions.notCalledAsTaggedError);
  });
});

describe("条件の列挙", () => {
  test("【NG】条件の重複がある", () => {
    const A = true;
    const B = false;
    const table = new ThinRichTable();

    const getResult = () => table.eval`
    | signal: ${A} | signal: ${B} | out: ${table.out} |
    | ------------ | ------------ | ----------------- |
    | ${true}      | ${true}      | ${0}              |
    | ${true}      | ${false}     | ${1}              |
    | ${true}      | ${true}      | ${2}              |
    `;
    expect(getResult).toThrowError(TRExceptions.duplicatedConditionError);
  });

  test("【NG】any指定で条件の重複", () => {
    const A = true;
    const B = false;
    const table = new ThinRichTable();

    const getResult = () => table.eval`
    | signal: ${A} | signal: ${B}      | out: ${table.out} |
    | ------------ | ----------------- | ----------------- |
    | ${true}      | ${true}           | ${0}              |
    | ${true}      | ${false}          | ${1}              |
    | ${true}      | ${table.cell.any} | ${2}              |
    `;
    expect(getResult).toThrowError(TRExceptions.duplicatedConditionError);
  });

  test("【OK】otherwise指定で条件の重複", () => {
    const A = true;
    const B = false;
    const table = new ThinRichTable();

    const result = table.eval`
    | signal: ${A} | signal: ${B}            | out: ${table.out} |
    | ------------ | ----------------------- | ----------------- |
    | ${true}      | ${table.cell.any}       | ${0}              |
    | ${false}     | ${false}                | ${1}              |
    | ${true}      | ${table.cell.otherwise} | ${2}              |
    `;
    expect(result).toBe(0);
  });

  test("【NG】複数のotherwise指定で条件の重複", () => {
    const A = true;
    const B = false;
    const table = new ThinRichTable();

    const getResult = () => table.eval`
    | signal: ${A}            | signal: ${B}            | out: ${table.out} |
    | ----------------------- | ----------------------- | ----------------- |
    | ${true}                 | ${true}                 | ${0}              |
    | ${false}                | ${false}                | ${1}              |
    | ${true}                 | ${table.cell.otherwise} | ${2}              |
    | ${table.cell.otherwise} | ${false}                | ${3}              |
    `;
    expect(getResult).toThrowError(TRExceptions.duplicatedConditionError);
  });
});

describe("出力列の指定", () => {
  test("【NG】出力列がundefined", () => {
    const A = true;
    const B = false;
    const table = new ThinRichTable();

    const getResult = () => table.eval`
    | conditions        | signal: ${A} | signal: ${B} | out: ${undefined} |
    | ----------------- | ------------ | ------------ | ----------------- |
    | all true          | ${true}      | ${true}      | ${1}              |
    | A: true, B: false | ${true}      | ${false}     | ${2}              |
    | A: false, B: true | ${false}     | ${true}      | ${3}              |
    | all false         | ${false}     | ${false}     | ${4}              |
    `;
    expect(getResult).toThrowError(TRExceptions.notDefinedOutputError);
  });

  test("【NG】出力列がない", () => {
    const A = true;
    const B = false;
    const table = new ThinRichTable();

    const getResult = () => table.eval`
    | conditions        | signal: ${A} | signal: ${B} | out: |
    | ----------------- | ------------ | ------------ | ---- |
    | all true          | ${true}      | ${true}      | ${1} |
    | A: true, B: false | ${true}      | ${false}     | ${2} |
    | A: false, B: true | ${false}     | ${true}      | ${3} |
    | all false         | ${false}     | ${false}     | ${4} |
    `;
    expect(getResult).toThrowError(TRExceptions.notDefinedOutputError);
  });

  test("【NG】出力列が複数", () => {
    const A = true;
    const B = false;
    const table = new ThinRichTable();

    const getResult = () => table.eval`
    | signal: ${A} | signal: ${B} | out: ${table.out} | out: ${table.out} |
    | ------------ | ------------ | ----------------- |------------------ |
    | ${true}      | ${true}      | ${1}              | ${1}              |
    | ${true}      | ${false}     | ${2}              | ${2}              |
    | ${false}     | ${true}      | ${3}              | ${3}              |
    | ${false}     | ${false}     | ${4}              | ${4}              |
    `;
    expect(getResult).toThrowError(TRExceptions.duplicatedOutputError);
  });

  test("【NG】条件の列数が合わない", () => {
    const A = true;
    const B = false;
    const table = new ThinRichTable();

    const getResult = () => table.eval`
    | signal: ${A} | signal: ${B} | out: ${table.out} |
    | ------------ | ------------ | ----------------- |
    | ${true}      | ${true}      | ${0}              |
    | ${true}      | ${false}     |                   |
    `;
    expect(getResult).toThrowError(TRExceptions.notMatchedColumnCountError);
  });
});

describe("複雑な条件指定", () => {
  test("【OK】商品の値段評価", () => {
    const order = 100;
    const stock = 50;
    const price = 10;
    const getPrice = (
      order: number,
      stock: number,
      isHalf: boolean,
      price: number
    ) => {
      const table = new ThinRichTable();
      // prettier-ignore
      return table.eval`
      | ${order > 0}       | ${stock >= order} | ${isHalf}         | ${table.out}           |
      | ------------------ | ----------------- | ----------------- | ---------------------- |
      | valid order amount | has enough stock  | discount flag     | calculated price       |
      | ${true}            | ${true}           | ${true}           | ${(order * price) / 2} |
      | ${true}            | ${false}          | ${true}           | ${(stock * price) / 2} |
      | ${true}            | ${true}           | ${false}          | ${order * price}       |
      | ${true}            | ${false}          | ${false}          | ${stock * price}       |
      | ${false}           | ${table.cell.any} | ${table.cell.any} | ${"Invalid order."}    |
      `
    };

    expect(getPrice(order, stock, true, price)).toBe((stock * price) / 2);
    expect(getPrice(order, stock, false, price)).toBe(stock * price);
    expect(getPrice(order, stock * 2, true, price)).toBe((order * price) / 2);
    expect(getPrice(-1, stock * 2, true, price)).toBe("Invalid order.");
  });
});

describe("論理回路的利用", () => {
  test("【OK】AND(フルデコード)", () => {
    const A = true;
    const B = false;
    const AND = (a: boolean, b: boolean) => {
      const gate = new ThinRichTable();
      return gate.eval`
      | ${a}     | ${b}     | ${gate.out} |
      | -------- | -------- | ----------- |
      | ${true}  | ${true}  | ${true}     |
      | ${true}  | ${false} | ${false}    |
      | ${false} | ${true}  | ${false}    |
      | ${false} | ${false} | ${false}    |
      `;
    };
    expect(AND(A, B)).toBe(A && B);
  });

  test("【OK】XOR(評価)", () => {
    const XOR = (a: boolean, b: boolean) => {
      const gate = new ThinRichTable();
      return gate.eval`
      | ${a}             | ${b}             | ${gate.out} |
      | ---------------- | ---------------- | ----------- |
      | ${gate.cell.any} | ${gate.cell.any} | ${a !== b}  |
      `;
    };
    expect(XOR(true, false)).toBe(true);
    expect(XOR(true, true)).toBe(false);
  });
});

describe("【OK】ヘッダーがリテラル、条件行が評価値", () => {
  const getMessage = (x: number, y: number, limit: number) => {
    const table = new ThinRichTable();
    return table.eval`
    | ${true}       | ${true}       | ${table.out}           |
    | ------------- | ------------- | ---------------------- |
    | ${x > limit}  | ${y > limit}  | ${`x & y > ${limit}`}  |
    | ${x > limit}  | ${y <= limit} | ${`x > ${limit}`}      |
    | ${x <= limit} | ${y > limit}  | ${`y > ${limit}`}      |
    | ${x <= limit} | ${y <= limit} | ${`x & y <= ${limit}`} |
    `;
  };

  expect(getMessage(122, 50, 100)).toBe("x > 100");
});
