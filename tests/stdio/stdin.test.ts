// Copyright 2023 Im-Beast. MIT license.

import { Stdin } from "../../src/stdio/stdin.ts";
import { assertEquals } from "../deps.ts";

Deno.test("stdio/stdin.ts", async (t) => {
  await t.step(
    "read() defaults to readSync() and binds methods to the impl",
    async () => {
      let calls = 0;
      const impl = {
        prefix: 2,
        readSync(buffer: Uint8Array) {
          ++calls;
          buffer.set([this.prefix, this.prefix + 1]);
          return 2;
        },
        close() {},
        isTerminal() {
          return true;
        },
      };

      const stdin = new Stdin(impl);
      const buffer = new Uint8Array(4);

      assertEquals(await stdin.read(buffer), 2);
      assertEquals(Array.from(buffer.subarray(0, 2)), [2, 3]);
      assertEquals(calls, 1);
      assertEquals(stdin.isTerminal(), true);
    },
  );

  await t.step("generated readable stream drains until EOF", async () => {
    const chunks = [[1, 2], [3], null] as const;
    let index = 0;
    const stdin = new Stdin({
      readSync(buffer: Uint8Array) {
        const chunk = chunks[index++];
        if (chunk === null) return null;
        buffer.set(chunk);
        return chunk.length;
      },
      close() {},
      isTerminal() {
        return false;
      },
    });

    const reader = stdin.readable.getReader();
    const values: number[][] = [];

    while (true) {
      const result = await reader.read();
      if (result.done) break;
      values.push(Array.from(result.value));
    }

    assertEquals(values, [[1, 2], [3]]);
  });
});
