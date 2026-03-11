// Copyright 2023 Im-Beast. MIT license.

import {
  clamp,
  fits,
  fitsInRectangle,
  normalize,
} from "../../src/utils/numbers.ts";
import { assertEquals } from "../deps.ts";

const { test: describe } = Deno;

describe("utils/numbers.ts", async ({ step: it }) => {
  await it("clamp()", () => {
    assertEquals(clamp(-5, 0, 10), 0);
    assertEquals(clamp(0, 0, 10), 0);
    assertEquals(clamp(-1, 0, 10), 0);
    assertEquals(clamp(5, 0, 10), 5);
    assertEquals(clamp(10, 0, 10), 10);
    assertEquals(clamp(10, 0, 11), 10);
  });

  await it("fits()", () => {
    assertEquals(fits(-1, 0, 1), false);
    assertEquals(fits(0.1, 0, 1), true);
    assertEquals(fits(0.9, 0, 1), true);
    assertEquals(fits(0, 0, 1), true);
    assertEquals(fits(1, 0, 1), true);
  });

  await it("fitsInRectangle()", () => {
    const rectangle = {
      column: 5,
      row: 5,
      width: 10,
      height: 10,
    };

    assertEquals(fitsInRectangle(0, 0, rectangle), false);
    assertEquals(fitsInRectangle(5, 0, rectangle), false);
    assertEquals(fitsInRectangle(0, 5, rectangle), false);
    assertEquals(fitsInRectangle(13, 0, rectangle), false);
    assertEquals(fitsInRectangle(13, 6, rectangle), true);
    assertEquals(fitsInRectangle(5, 5, rectangle), true);
    assertEquals(fitsInRectangle(14, 14, rectangle), true);
    assertEquals(fitsInRectangle(15, 15, rectangle), false);
  });

  await it("normalize()", () => {
    assertEquals(normalize(50, 0, 100), 0.5);
    assertEquals(normalize(0, -100, 100), 0.5);
  });
});
