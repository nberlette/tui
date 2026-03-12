// Copyright 2023 Im-Beast. MIT license.

import { View } from "../src/view.ts";
import { assertEquals } from "./deps.ts";

Deno.test("view.ts", async (t) => {
  await t.step("constructor applies default offsets", () => {
    const view = new View({
      rectangle: { column: 1, row: 2, width: 3, height: 4 },
    });

    assertEquals(view.rectangle.peek(), {
      column: 1,
      row: 2,
      width: 3,
      height: 4,
    });
    assertEquals(view.offset.peek(), { columns: 0, rows: 0 });
    assertEquals(view.maxOffset.peek(), { columns: 0, rows: 0 });
  });

  await t.step("constructor preserves provided offsets", () => {
    const view = new View({
      rectangle: { column: 0, row: 0, width: 10, height: 5 },
      offset: { columns: 2, rows: 3 },
      maxOffset: { columns: 8, rows: 9 },
    });

    assertEquals(view.offset.peek(), { columns: 2, rows: 3 });
    assertEquals(view.maxOffset.peek(), { columns: 8, rows: 9 });
  });
});
