// Copyright 2023 Im-Beast. MIT license.

import { Effect, effect } from "../../src/signals/effect.ts";
import { Signal } from "../../src/signals/signal.ts";
import { assertEquals, assertThrows } from "../deps.ts";

Deno.test("signals/effect.ts", async (t) => {
  await t.step("effect() runs immediately and reacts to updates", async () => {
    const source = new Signal(1);
    const values: number[] = [];

    const instance = effect(() => {
      values.push(source.value);
    });

    await Promise.resolve();
    source.value = 2;

    assertEquals(instance instanceof Effect, true);
    assertEquals(values, [1, 2]);
  });

  await t.step("pause(), resume() and dispose() control updates", async () => {
    const source = new Signal(1);
    const values: number[] = [];
    const instance = new Effect(() => {
      values.push(source.value);
    });

    await Promise.resolve();
    instance.pause();
    source.value = 2;
    instance.resume();
    source.value = 3;

    assertEquals(values, [1, 3]);

    instance.dispose();
    assertThrows(() => instance.pause(), ReferenceError);
  });
});
