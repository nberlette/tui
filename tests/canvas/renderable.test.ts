// Copyright 2023 Im-Beast. MIT license.

import { Renderable } from "../../src/canvas/renderable.ts";
import { View } from "../../src/view.ts";
import { signalify } from "../../src/signals/signalify.ts";
import { assertEquals } from "../deps.ts";
import { createCanvas, identityStyle } from "../fixtures.ts";

class TestRenderable extends Renderable<"test"> {
  constructor(
    options: ConstructorParameters<typeof Renderable<"test">>[1] & {
      rectangle: { column: number; row: number; width: number; height: number };
    },
  ) {
    super("test", options);
    this.rectangle = signalify(options.rectangle, { deepObserve: true });
  }
}

Deno.test("canvas/renderable.ts", async (t) => {
  await t.step("queueRerender() respects canvas and view bounds", () => {
    const { canvas } = createCanvas({ columns: 4, rows: 3 });
    const view = new View({
      rectangle: { column: 1, row: 1, width: 2, height: 1 },
    });
    const renderable = new TestRenderable({
      canvas,
      style: identityStyle,
      zIndex: 0,
      view,
      rectangle: { column: 0, row: 0, width: 2, height: 2 },
    });

    renderable.queueRerender(-1, 0);
    renderable.queueRerender(0, 10);
    renderable.queueRerender(1, 1);
    renderable.queueRerender(1, 2);
    renderable.queueRerender(0, 0);

    assertEquals(Array.from(renderable.rerenderCells[1] ?? []), [1, 2]);
    assertEquals(renderable.rerenderCells[0], undefined);
  });

  await t.step(
    "updateOutOfBounds() handles zero-size and off-view rectangles",
    () => {
      const { canvas } = createCanvas({ columns: 4, rows: 3 });
      const view = new View({
        rectangle: { column: 0, row: 0, width: 2, height: 2 },
      });
      const renderable = new TestRenderable({
        canvas,
        style: identityStyle,
        zIndex: 0,
        view,
        rectangle: { column: 0, row: 0, width: 1, height: 1 },
      });

      renderable.updateOutOfBounds();
      assertEquals(renderable.outOfBounds, false);

      renderable.rectangle.value.width = 0;
      renderable.updateOutOfBounds();
      assertEquals(renderable.outOfBounds, true);

      renderable.rectangle.value.width = 1;
      renderable.rectangle.value.column = 5;
      renderable.updateOutOfBounds();
      assertEquals(renderable.outOfBounds, true);
    },
  );
});
