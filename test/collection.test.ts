import { describe, test, expect } from "@jest/globals";
import { splitArrayAsNLength, hasDuplicated } from "../src/collection";

describe("split", () => {
  test("【OK】指定長に分割", () => {
    const array = [0, 1, 2, 3, 4, 5];
    const output = [
      [0, 1, 2],
      [3, 4, 5],
    ];
    expect(splitArrayAsNLength(array, 3)).toEqual(output);
  });

  test("【OK】指定長に分割であまりが出る", () => {
    const array = [0, 1, 2, 3, 4];
    const output = [
      [0, 1, 2],
      [3, 4],
    ];
    expect(splitArrayAsNLength(array, 3)).toEqual(output);
  });
});

describe("hasDuplicated", () => {
  test("【OK】重複あり(単純)", () => {
    const array = [
      [0, 1],
      [0, 1],
    ];
    expect(hasDuplicated(array)).toBe(true);
  });

  test("【OK】重複あり(整数と小数表記)", () => {
    const array = [
      [0, 1],
      [0.0, 1],
    ];
    expect(hasDuplicated(array)).toBe(true);
  });

  test("【OK】重複あり(整数と文字列表記)", () => {
    const array = [
      [0, 1],
      ["0", 1],
    ];
    expect(hasDuplicated(array)).toBe(true);
  });

  test("【OK】重複なし", () => {
    const array = [
      [0, 1],
      [0, 2],
      [1, 0],
    ];
    expect(hasDuplicated(array)).toBe(false);
  });
});
