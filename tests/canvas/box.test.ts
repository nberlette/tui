// Copyright 2023 Im-Beast. MIT license.

import { BoxObject } from "../../src/canvas/box.ts";
import { assertEquals } from "../deps.ts";
import { createCanvas } from "../fixtures.ts";

Deno.test("canvas/box.ts", () => {
  const { canvas } = createCanvas({ columns: 5, rows: 2 });
  const box = new BoxObject({
    canvas,
    style: (text) => `<${text}>`,
    zIndex: 0,
    filler: "x",
    rectangle: { column: 0, row: 0, width: 3, height: 1 },
  });

  box.queueRerender(0, 0);
  box.queueRerender(0, 1);
  box.queueRerender(0, 2);
  box.omitCells[0] = new Set([1]);

  box.rerender();

  assertEquals(canvas.frameBuffer[0][0], "<x>");
  assertEquals(canvas.frameBuffer[0][1], undefined);
  assertEquals(canvas.frameBuffer[0][2], "<x>");
  assertEquals(Array.from(canvas.rerenderQueue[0] ?? []), [0, 2]);
  assertEquals(Array.from(box.rerenderCells[0] ?? []), []);
});
