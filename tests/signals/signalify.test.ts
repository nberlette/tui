// Copyright 2023 Im-Beast. MIT license.

import { isSignal, Signal } from "../../src/signals/signal.ts";
import { signalify } from "../../src/signals/signalify.ts";
import { assertEquals, assertStrictEquals } from "../deps.ts";

Deno.test("signals/signalify.ts", async (t) => {
  await t.step("returns the same Signal instance when given one", () => {
    const signal = new Signal(1);
    assertStrictEquals(signalify(signal), signal);
  });

  await t.step("wraps plain values and respects deep observation", () => {
    const signal = signalify<{ value: number }>({ value: 1 }, {
      deepObserve: true,
      watchObjectIndex: true,
    });
    let calls = 0;
    signal.subscribe(() => ++calls);

    signal.value.value = 2;

    assertEquals(isSignal(signal), true);
    assertEquals(calls, 1);
    assertEquals(signal.value.value, 2);
  });
});
