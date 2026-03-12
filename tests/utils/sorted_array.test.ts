// Copyright 2023 Im-Beast. MIT license.

import assert from "node:assert";
import { SortedArray } from "../../src/utils/sorted_array.ts";
import { assertEquals } from "../deps.ts";

const { test: describe } = Deno;

describe("sortedArray", async ({ step: it }) => {
  await it("should be a function named 'SortedArray'", () => {
    assertEquals(typeof SortedArray, "function");
    assertEquals(SortedArray.name, "SortedArray");
  });
  await it("should be a class constructor", () => {
    const instance = new SortedArray();
    assertEquals(instance instanceof SortedArray, true);
  });
  await it("should require the `new` operator", () => {
    assert.throws(() => {
      // @ts-expect-error - this is intentional
      SortedArray();
    }, TypeError);
  });
  await it("should maintain a sorted order", () => {
    const array = new SortedArray<number>((a, b) => b - a);

    array.push(1, 10, -5, -2, 11, 100, -1000);
    assertEquals([...array], [100, 11, 10, 1, -2, -5, -1000]);
    array.remove(11);
    assertEquals([...array], [100, 10, 1, -2, -5, -1000]);
  });
});
