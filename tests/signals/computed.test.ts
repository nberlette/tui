// Copyright 2023 Im-Beast. MIT license.

import { Computed, computed } from "../../src/signals/computed.ts";
import { Signal } from "../../src/signals/signal.ts";
import { assertEquals, assertThrows } from "../deps.ts";

Deno.test("signals/computed.ts", async (t) => {
  await t.step("computed() updates when dependencies change", async () => {
    const source = new Signal(2);
    const doubled = computed(() => source.value * 2);

    await Promise.resolve();
    assertEquals(doubled.value, 4);

    source.value = 5;
    assertEquals(doubled.value, 10);
  });

  await t.step("Computed is read-only and can be disposed", async () => {
    const source = new Signal(3);
    const tripled = new Computed(() => source.value * 3);

    await Promise.resolve();
    assertThrows(() => {
      tripled.value = 99;
    }, Error);
    assertThrows(() => tripled.jink(99), Error);

    tripled.dispose();
    source.value = 4;
    assertEquals(tripled.value, 9);
  });
});
