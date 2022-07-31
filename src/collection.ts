import deepEqual from "deep-equal";

export const splitArrayAsNLength = (vars: unknown[], count: number) => {
  return vars.flatMap((_, index, array) => {
    return index % count !== 0 ? [] : [array.slice(index, index + count)];
  });
};

// Set() cannot detect not primitive value.
// ex: new Set([ [0, 1], [0, 1] ]) => Set(2) { [ 0, 1 ], [ 0, 1 ] }
export const hasDuplicated = (values: unknown[]) => {
  for (let i = 0; i < values.length; i++) {
    // Check from next index.
    for (let j = i + 1; j < values.length; j++) {
      if (deepEqual(values[i], values[j])) return true;
    }
  }
  return false;
};
