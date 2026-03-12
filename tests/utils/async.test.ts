// Copyright 2023 Im-Beast. MIT license.

import { isPromise } from "node:util/types";
import { sleep } from "../../src/utils/async.ts";
import { performance } from "../../src/utils/performance.ts";
import { assertAlmostEquals } from "../deps.ts";
import assert from "node:assert";
import { mock } from "node:test";

const { test: describe } = Deno;

describe("sleep()", async ({ step: it }) => {
  await it("is a function", () => {
    assert.strict(typeof sleep === "function");
  });
  await it("is named 'sleep'", () => {
    assert.strictEqual(sleep.name, "sleep");
  });
  await it("has an arity of 1", () => {
    assert.strictEqual(sleep.length, 1);
  });
  await it("returns a promise", () => {
    const result = sleep(100);
    assert.strict(isPromise(result), "Expected sleep to return a promise");
  });

  const intervals = [0, 1, 33, 50, 100, 150] as const;

  for (const interval of intervals) {
    await it(`should pause execution for ${interval}ms`, async () => {
      const start = performance.now();
      await sleep(interval);
      assertAlmostEquals(performance.now() - start, interval, 10);
    });
  }

  await it("does not block the main thread", async () => {
    let now = 0;
    const milestones: number[] = [];

    const nowMock = mock.method(performance, "now", () => now);

    try {
      const sleeping = sleep(20);
      let concurrentResolved = false;

      const concurrent = (async () => {
        await Promise.resolve();
        now = 5;
        milestones.push(performance.now());

        await sleep(0);
        now = 10;
        concurrentResolved = true;
        milestones.push(performance.now());
      })();

      await concurrent;

      assert.strictEqual(
        concurrentResolved,
        true,
        "Expected other async work to finish while sleep was pending",
      );
      assert.deepStrictEqual(milestones, [5, 10]);

      now = 20;
      await sleeping;
    } finally {
      nowMock.mock.restore();
    }
  });
});
