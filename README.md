# Thin Rich Table

## これなに

マークダウンの表形式で書いた真理値表(風のテーブル)を評価するやつ。

## コンセプト

- Thin (ファイルサイズが軽量)
- Rich (Markdown のテーブル記法を利用できる)

を特徴とする。

ヘッダ行で指定された変数に対し、真理値表形式で記述した条件をもとに評価を行う。

## インストール

```bash
npm install --save thin-rich-table
```

## 使い方

```javascript
import { ThinRichTable } from "thin-rich-table";
const table = new ThinRichTable();
const result = table.eval`
Write markdown table like conditions here.
`;
```

### 例

AND 回路

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

表の行にはリテラル形式でコメントを記述することもできる。

金額計算

```javascript
// 注文数
const order = 100;
// 在庫数
const stock = 50;
// 単価
const price = 10;

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

// 本ライブラリを利用した記述
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

getPrice(order, stock, true, price) === (stock * price) / 2;
getPrice(order, stock, false, price) === stock * price;
getPrice(order, stock * 2, true, price) === (order * price) / 2;
getPrice(-1, stock * 2, true, price) === "Invalid order.";
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
