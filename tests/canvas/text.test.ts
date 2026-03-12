// Copyright 2023 Im-Beast. MIT license.

import { TextObject } from "../../src/canvas/text.ts";
import { assertEquals } from "../deps.ts";
import { createCanvas, flush, identityStyle } from "../fixtures.ts";

Deno.test("canvas/text.ts", async (t) => {
  await t.step(
    "auto-sizes its rectangle when overwriteRectangle is false",
    async () => {
      const { canvas } = createCanvas();
      const text = new TextObject({
        canvas,
        style: identityStyle,
        zIndex: 0,
        value: "Hello",
        rectangle: { column: 0, row: 0 },
      });

      await flush();

      assertEquals(text.rectangle.peek().width, 5);
      assertEquals(text.rectangle.peek().height, 1);
    },
  );

  await t.step("supports multi-code-point character splitting", async () => {
    const { canvas } = createCanvas();
    const text = new TextObject({
      canvas,
      style: identityStyle,
      zIndex: 0,
      value: "A👀B",
      rectangle: { column: 0, row: 0 },
      multiCodePointSupport: true,
    });

    await flush();

    assertEquals(text.valueChars, ["A", "👀", "B"]);
    assertEquals(text.rectangle.peek().width, 4);
  });
});
