// Copyright 2023 Im-Beast. MIT license.

import { Component } from "../src/component.ts";
import { assertEquals } from "./deps.ts";
import { createFakeRoot, flush } from "./fixtures.ts";

class TestComponent extends Component {
}

Deno.test("component.ts", async (t) => {
  await t.step("interact() records the last interaction", async () => {
    const { root } = createFakeRoot();
    const component = new TestComponent({
      parent: root as never,
      theme: {},
      rectangle: { column: 0, row: 0, width: 1, height: 1 },
      zIndex: 0,
    });

    await flush();
    component.interact("mouse");

    assertEquals(component.lastInteraction.method, "mouse");
    assertEquals(component.lastInteraction.time > 0, true);
  });

  await t.step(
    "changeDrawnObjectVisibility() toggles singletons and arrays",
    async () => {
      const { root } = createFakeRoot();
      const component = new TestComponent({
        parent: root as never,
        theme: {},
        rectangle: { column: 0, row: 0, width: 1, height: 1 },
        zIndex: 0,
      });
      const calls: string[] = [];

      component.drawnObjects = {
        single: {
          draw: () => calls.push("single:draw"),
          erase: () => calls.push("single:erase"),
        },
        many: [
          {
            draw: () => calls.push("many1:draw"),
            erase: () => calls.push("many1:erase"),
          },
          {
            draw: () => calls.push("many2:draw"),
            erase: () => calls.push("many2:erase"),
          },
        ],
      } as never;

      component.changeDrawnObjectVisibility(false, true);

      assertEquals(calls, ["single:erase", "many1:erase", "many2:erase"]);
      assertEquals(component.drawnObjects, {});
    },
  );
});
