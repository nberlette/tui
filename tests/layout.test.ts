// Copyright 2023 Im-Beast. MIT license.

import {
  GridLayout,
  HorizontalLayout,
  Layout,
  LayoutInvalidElementsPatternError,
  LayoutMissingElementError,
  VerticalLayout,
} from "../src/layout/mod.ts";
import type { Rectangle } from "../src/types.ts";
import { assertEquals, assertThrows } from "./deps.ts";

function rectSnapshot<T extends string>(
  layout: { element(name: T): { peek(): Rectangle } },
  name: T,
) {
  const rectangle = layout.element(name).peek();
  return {
    column: rectangle.column,
    row: rectangle.row,
    width: rectangle.width,
    height: rectangle.height,
  };
}

Deno.test("layout public APIs", async (t) => {
  await t.step("Layout cannot be instantiated directly", () => {
    const AbstractLayout = Layout as unknown as { new (): Layout<string> };
    assertThrows(
      () => new AbstractLayout(),
      TypeError,
      "Illegal constructor",
    );
  });

  await t.step("VerticalLayout computes and updates rectangles", async () => {
    const layout = new VerticalLayout({
      pattern: ["header", "body", "body"],
      rectangle: { column: 0, row: 0, width: 12, height: 9 },
    });

    assertEquals(layout.rect, layout.rectangle);
    assertEquals(rectSnapshot(layout, "header"), {
      column: 0,
      row: 0,
      width: 12,
      height: 3,
    });
    assertEquals(rectSnapshot(layout, "body"), {
      column: 0,
      row: 3,
      width: 12,
      height: 6,
    });

    await Promise.resolve();
    layout.rectangle.value.height = 12;

    assertEquals(rectSnapshot(layout, "header"), {
      column: 0,
      row: 0,
      width: 12,
      height: 4,
    });
    assertEquals(rectSnapshot(layout, "body"), {
      column: 0,
      row: 4,
      width: 12,
      height: 8,
    });
    assertThrows(
      () => (layout as { element(name: string): unknown }).element("footer"),
      LayoutMissingElementError,
      `Element "footer" hasn't been found in layout`,
    );
  });

  await t.step(
    "HorizontalLayout computes rectangles and validates patterns",
    async () => {
      const layout = new HorizontalLayout({
        pattern: ["left", "left", "right"],
        rectangle: { column: 0, row: 0, width: 9, height: 4 },
        gapY: 1,
      });

      assertEquals(rectSnapshot(layout, "left"), {
        column: 0,
        row: 1,
        width: 6,
        height: 2,
      });
      assertEquals(rectSnapshot(layout, "right"), {
        column: 6,
        row: 1,
        width: 3,
        height: 2,
      });

      await Promise.resolve();
      layout.rectangle.value.width = 12;

      assertEquals(rectSnapshot(layout, "left"), {
        column: 0,
        row: 1,
        width: 8,
        height: 2,
      });
      assertEquals(rectSnapshot(layout, "right"), {
        column: 8,
        row: 1,
        width: 4,
        height: 2,
      });

      assertThrows(
        () =>
          new HorizontalLayout({
            pattern: ["a", "b", "a"],
            rectangle: { column: 0, row: 0, width: 3, height: 1 },
          }).updatePattern(),
        LayoutInvalidElementsPatternError,
      );
    },
  );

  await t.step("GridLayout computes spans", () => {
    const layout = new GridLayout({
      pattern: [
        ["a", "a", "b"],
        ["c", "d", "d"],
      ],
      rectangle: { column: 0, row: 0, width: 12, height: 4 },
    });

    assertEquals(rectSnapshot(layout, "a"), {
      column: 0,
      row: 0,
      width: 8,
      height: 2,
    });
    assertEquals(rectSnapshot(layout, "b"), {
      column: 8,
      row: 0,
      width: 4,
      height: 2,
    });
    assertEquals(rectSnapshot(layout, "c"), {
      column: 0,
      row: 2,
      width: 4,
      height: 2,
    });
    assertEquals(rectSnapshot(layout, "d"), {
      column: 4,
      row: 2,
      width: 8,
      height: 2,
    });
  });
});
