// Copyright 2023 Im-Beast. MIT license.

import { Box } from "../../src/components/box.ts";
import { BoxObject } from "../../src/canvas/box.ts";
import { assertEquals, assertStrictEquals } from "../deps.ts";
import { createFakeRoot, flush } from "../fixtures.ts";

Deno.test("components/box.ts", async () => {
  const { root } = createFakeRoot();
  const component = new Box({
    parent: root as never,
    theme: {},
    rectangle: { column: 1, row: 1, width: 2, height: 3 },
    zIndex: 0,
  });

  await flush();
  component.draw();

  assertEquals(component.drawnObjects.box instanceof BoxObject, true);
  assertStrictEquals(component.drawnObjects.box.rectangle, component.rectangle);
  assertStrictEquals(component.drawnObjects.box.style, component.style);
});
