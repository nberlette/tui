// Copyright 2023 Im-Beast. MIT license.

import { BoxObject } from "../../src/canvas/box.ts";
import { assertEquals } from "../deps.ts";
import { createCanvas, flush, identityStyle } from "../fixtures.ts";

Deno.test("canvas/canvas.ts", async (t) => {
  await t.step("updateIntersections() tracks overlapping objects", () => {
    const { canvas } = createCanvas({ columns: 5, rows: 3 });
    const lower = new BoxObject({
      canvas,
      style: identityStyle,
      zIndex: 0,
      rectangle: { column: 0, row: 0, width: 2, height: 1 },
    });
    const higher = new BoxObject({
      canvas,
      style: identityStyle,
      zIndex: 1,
      rectangle: { column: 1, row: 0, width: 2, height: 1 },
    });

    lower.draw();
    higher.draw();

    canvas.updateIntersections(higher);
    canvas.updateIntersections(lower);

    assertEquals(higher.objectsUnder.has(lower), true);
    assertEquals(lower.omitCells[0]?.has(1), true);
  });

  await t.step(
    "render() writes queued cells and clears update state",
    async () => {
      const { canvas, writes } = createCanvas({ columns: 4, rows: 2 });
      const box = new BoxObject({
        canvas,
        style: identityStyle,
        zIndex: 0,
        filler: "#",
        rectangle: { column: 0, row: 0, width: 2, height: 1 },
      });

      let renders = 0;
      canvas.on("render", () => {
        ++renders;
      });

      box.draw();
      await flush();
      canvas.render();

      assertEquals(writes.length > 0, true);
      assertEquals(canvas.updateObjects.length, 0);
      assertEquals(Array.from(canvas.rerenderQueue[0] ?? []), []);
      assertEquals(renders, 1);
    },
  );
});
