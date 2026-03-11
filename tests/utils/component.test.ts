// Copyright 2023 Im-Beast. MIT license.

import {
  getComponentClosestToTopLeftCorner,
  isInteractable,
} from "../../src/utils/component.ts";
import { Component } from "../../src/component.ts";
import { assertEquals } from "../deps.ts";

class InteractableComponent extends Component {
  override interact(method: "keyboard" | "mouse"): void {
    super.interact(method);
  }
}

Deno.test("utils/component.ts", async (t) => {
  await t.step("isInteractable() detects overridden interact()", () => {
    assertEquals(
      isInteractable(Component.prototype as unknown as Component),
      false,
    );
    assertEquals(
      isInteractable(InteractableComponent.prototype as unknown as Component),
      true,
    );
  });

  await t.step("getComponentClosestToTopLeftCorner() honors filters", () => {
    const far = {
      rectangle: { peek: () => ({ column: 4, row: 4, width: 1, height: 1 }) },
      zIndex: { peek: () => 1 },
    };
    const close = {
      rectangle: { peek: () => ({ column: 0, row: 1, width: 1, height: 1 }) },
      zIndex: { peek: () => 2 },
    };
    const tui = { components: new Set([far, close]) };

    assertEquals(getComponentClosestToTopLeftCorner(tui as never), close);
    assertEquals(
      getComponentClosestToTopLeftCorner(
        tui as never,
        (component) => component === far,
      ),
      far,
    );
  });
});
