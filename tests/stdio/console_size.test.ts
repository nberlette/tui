// Copyright 2023 Im-Beast. MIT license.

import {
  consoleSize,
  defaultConsoleSize,
} from "../../src/stdio/console_size.ts";
import { assertEquals, assertNotStrictEquals } from "../deps.ts";

Deno.test("stdio/console_size.ts", async (t) => {
  await t.step("defaultConsoleSize is 80x24", () => {
    assertEquals(defaultConsoleSize, { columns: 80, rows: 24 });
  });

  await t.step("consoleSize() reads process stdout dimensions first", () => {
    const original = globalThis.process;
    Object.defineProperty(globalThis, "process", {
      value: {
        stdout: { columns: 111, rows: 22 },
        stderr: { columns: 1, rows: 1 },
        env: {},
      },
      configurable: true,
    });

    try {
      assertEquals(consoleSize(), { columns: 111, rows: 22 });
    } finally {
      Object.defineProperty(globalThis, "process", {
        value: original,
        configurable: true,
      });
    }
  });

  await t.step("consoleSize() falls back to env and cloned defaults", () => {
    const original = globalThis.process;
    Object.defineProperty(globalThis, "process", {
      value: {
        stdout: { columns: 0, rows: 0, getWindowSize: undefined },
        stderr: { columns: 0, rows: 0 },
        env: { COLUMNS: "90", LINES: "33" },
      },
      configurable: true,
    });

    try {
      assertEquals(consoleSize(), { columns: 90, rows: 33 });
    } finally {
      Object.defineProperty(globalThis, "process", {
        value: original,
        configurable: true,
      });
    }

    const defaults = { columns: 7, rows: 9 };
    Object.defineProperty(globalThis, "process", {
      get() {
        throw new Error("boom");
      },
      configurable: true,
    });

    try {
      const size = consoleSize(defaults);
      assertEquals(size, defaults);
      assertNotStrictEquals(size, defaults);
    } finally {
      Object.defineProperty(globalThis, "process", {
        value: original,
        configurable: true,
      });
    }
  });
});
