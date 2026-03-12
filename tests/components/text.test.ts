// Copyright 2023 Im-Beast. MIT license.

import { Text } from "../../src/components/text.ts";
import { TextObject } from "../../src/canvas/text.ts";
import { assertEquals, assertStrictEquals } from "../deps.ts";
import { createFakeRoot, flush } from "../fixtures.ts";

Deno.test("components/text.ts", async (t) => {
  await t.step(
    "draw() creates a TextObject wired to component signals",
    async () => {
      const { root } = createFakeRoot();
      const component = new Text({
        parent: root as never,
        theme: {},
        text: "Hello",
        rectangle: { column: 0, row: 0 },
        zIndex: 0,
      });

      await flush();
      component.draw();

      assertEquals(component.drawnObjects.text instanceof TextObject, true);
      assertStrictEquals(component.drawnObjects.text.text, component.text);
    },
  );

  await t.step(
    "overwriteWidth=false auto-sizes while true preserves width",
    async () => {
      const { root } = createFakeRoot();
      const auto = new Text({
        parent: root as never,
        theme: {},
        text: "abcd",
        rectangle: { column: 0, row: 0 },
        zIndex: 0,
      });
      const fixed = new Text({
        parent: root as never,
        theme: {},
        text: "abcd",
        overwriteWidth: true,
        rectangle: { column: 0, row: 1, width: 10 },
        zIndex: 1,
      });

      await flush();
      auto.draw();
      fixed.draw();
      await flush();

      assertEquals(auto.rectangle.peek().width, 4);
      assertEquals(fixed.rectangle.peek().width, 10);
    },
  );
});
