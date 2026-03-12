// Copyright 2023 Im-Beast. MIT license.

import { Stdout } from "../../src/stdio/stdout.ts";
import { assertEquals } from "../deps.ts";

Deno.test("stdio/stdout.ts", async (t) => {
  await t.step(
    "write() defaults to writeSync() and preserves bindings",
    async () => {
      const writes: number[][] = [];
      const stdout = new Stdout(
        {
          prefix: 9,
          writeSync(chunk: Uint8Array) {
            writes.push([this.prefix, ...chunk]);
            return chunk.byteLength;
          },
          close() {},
          isTerminal() {
            return false;
          },
        } as Stdout & { prefix: number },
      );

      assertEquals(await stdout.write(new Uint8Array([1, 2])), 2);
      assertEquals(writes, [[9, 1, 2]]);
      assertEquals(stdout.isTerminal(), false);
    },
  );

  await t.step(
    "generated writable stream keeps flushing partial writes",
    async () => {
      const writes: number[][] = [];
      const stdout = new Stdout({
        writeSync(chunk: Uint8Array) {
          writes.push(Array.from(chunk));
          return chunk.byteLength;
        },
        write(chunk: Uint8Array) {
          writes.push(Array.from(chunk));
          return Promise.resolve(Math.min(2, chunk.byteLength));
        },
        isTerminal() {
          return true;
        },
        close() {},
      } as Stdout);

      const writer = stdout.writable.getWriter();
      await writer.write(new Uint8Array([1, 2, 3, 4, 5]));
      await writer.close();

      assertEquals(writes, [
        [1, 2, 3, 4, 5],
        [3, 4, 5],
        [5],
      ]);
      assertEquals(stdout.isTerminal(), true);
    },
  );
});
