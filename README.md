# Thin Rich Table

## これなに / About

マークダウンの表形式で書いた真理値表(風のテーブル)を評価するやつ。

The one to evaluate a truth table-style table written in Markdown.

## コンセプト / Concept

- Thin (ファイルサイズが軽量)
- Rich (Markdown のテーブル記法を利用できる)

を特徴とする。

It features the following

- Thin (Lightweight file size)
- Rich (Markdown table notation can be used)

ヘッダ行で指定された変数に対し、真理値表形式で記述した条件をもとに評価を行う。

This evaluates variables specified in the header line based on the conditions described in a truth table format.

## インストール / Install

```bash
npm install --save thin-rich-table
```

## 使い方 / How to Use

```javascript
import { ThinRichTable } from "thin-rich-table";
const table = new ThinRichTable();
const result = table.eval`
Write markdown table like conditions here.
`;
```

### 例

AND 回路 / AND circuit

```javascript
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
AND(true, true) === true;
AND(true, false) === false;
```

複雑な条件の場合など、`any`や`otherwise`を指定することもできる。

`any` or `otherwise` may be specified, for example ,for complex conditions.

表の行にはリテラル形式でコメントを記述することもできる。

You can write comments in table rows in literal format.

金額計算 / Calculating the amount of money

`if`を利用した場合、下記のように複雑になることがある。

Like the following, there are times it be complicated branch when using `if` .

```javascript
// ifを利用した記述
const getPriceIf = (
  order: number,
  stock: number,
  isHalf: boolean,
  price: number
) => {
  if (order <= 0) return "invalid order";
  if (stock >= order) {
    if (isHalf) {
      return (order * stock) / 2;
    } else {
      // ...
    }
  }
  // ...
};
```

本ライブラリを利用すると表を用いて宣言的に評価できる。

You can evaluate declaratively with table by using this library.

```javascript
// 注文数
const order = 100;
// 在庫数
const stock = 50;
// 単価
const price = 10;

const getPriceTable = (
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

getPriceTable(order, stock, true, price) === (stock * price) / 2;
getPriceTable(order, stock, false, price) === stock * price;
getPriceTable(order, stock * 2, true, price) === (order * price) / 2;
getPriceTable(-1, stock * 2, true, price) === "Invalid order.";
```

上記のテーブル部分は Markdown で下記表に相当する。

| \${order > 0}      | \${stock >= order} | \${isHalf}        | \${table.out}           |
| ------------------ | ------------------ | ----------------- | ----------------------- |
| valid order amount | has enough stock   | discount flag     | calculated price        |
| ${true}            | ${true}            | ${true}           | ${(order \* price) / 2} |
| ${true}            | ${false}           | ${true}           | ${(stock \* price) / 2} |
| ${true}            | ${true}            | ${false}          | ${order \* price}       |
| ${true}            | ${false}           | ${false}          | ${stock \* price}       |
| ${false}           | ${table.cell.any}  | ${table.cell.any} | ${"Invalid order."}     |

ヘッダ行に`true`, `false`などを指定し、条件列に評価値を記載することもできる。

```javascript
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

getMessage(122, 50, 100) === "x > 100";
```

### セルの値の指定 / On specifying cell values

`const table = new ThinRichTable()`とした場合

| 値                     | 内容                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| `table.out`            | 出力値とする列(表の右端の列に指定する)<br>Column as output (Specify in the rightmost column of the table) |
| `table.cell.any`       | 任意の値(明示的な指定と同じ優先度)<br>Arbitrary value (Same priority as explicit specification)           |
| `table.cell.otherwise` | 任意の値(`cell.any`より優先度低)<br>Arbitrary value (Lower priority than `cell.any`)                      |

例えば下記の場合は`{ flagA: true, flagB: true }`の場合両方にマッチするため重複エラーとなる。

For example, in case the following table is defined `{ flagA: true, flagB: true }` matches both, resulting in a duplicate error.

| pattern   | ${flagA} | ${flagB}          | ${table.out} |
| --------- | -------- | ----------------- | ------------ |
| both true | ${true}  | ${true}           | ${true}      |
| else      | ${true}  | ${table.cell.any} | ${false}     |

下記の場合

In the following case

| pattern   | ${flagA} | ${flagB}                | ${table.out} |
| --------- | -------- | ----------------------- | ------------ |
| both true | ${true}  | ${true}                 | ${true}      |
| else      | ${true}  | ${table.cell.otherwise} | ${false}     |

- `{ flagA: true, flagB: true }` => `both true`
- `{ flagA: true, flagB: false }` => `else`
- `{ flagA: true, flagB: undefined }` => `else`

となり評価される。

and as a result, will be evaluated.
