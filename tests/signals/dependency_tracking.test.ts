// Copyright 2023 Im-Beast. MIT license.

import {
  optimizeDependencies,
  trackDependencies,
} from "../../src/signals/dependency_tracking.ts";
import { Signal } from "../../src/signals/signal.ts";
import { assertEquals } from "../deps.ts";

Deno.test("signals/dependency_tracking.ts", async (t) => {
  await t.step("trackDependencies() collects accessed signals", async () => {
    const signal = new Signal(1);
    const dependencies = new Set<unknown>();

    await trackDependencies(dependencies as never, null, () => {
      signal.value;
    });

    assertEquals(dependencies.has(signal), true);
  });

  await t.step(
    "optimizeDependencies() replaces composite dependencies with roots",
    () => {
      const rootA = new Signal(1);
      const rootB = new Signal(2);
      const composite = {
        dependencies: new Set([rootA, rootB]),
      };

      const dependencies = new Set([composite, rootA]);
      optimizeDependencies(dependencies as never);

      assertEquals(dependencies.has(composite), false);
      assertEquals(dependencies.has(rootA), true);
      assertEquals(dependencies.has(rootB), true);
    },
  );
});
