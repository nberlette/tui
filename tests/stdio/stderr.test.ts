// Copyright 2023 Im-Beast. MIT license.

import { Stderr } from "../../src/stdio/stderr.ts";
import { assertEquals } from "../deps.ts";

Deno.test("stdio/stderr.ts", async (t) => {
  await t.step("write() defaults to writeSync()", async () => {
    const writes: number[][] = [];
    const stderr = new Stderr({
      writeSync(chunk: Uint8Array) {
        writes.push(Array.from(chunk));
        return chunk.byteLength;
      },
      write(chunk: Uint8Array) {
        return Promise.resolve(this.writeSync(chunk));
      },
      close() {},
      isTerminal() {
        return false;
      },
    } as Stderr);

    assertEquals(await stderr.write(new Uint8Array([7, 8])), 2);
    assertEquals(writes, [[7, 8]]);
    assertEquals(stderr.isTerminal(), false);
  });

  await t.step(
    "generated writable stream supports partial writes",
    async () => {
      const writes: number[][] = [];
      const stderr = new Stderr({
        writeSync(chunk: Uint8Array) {
          writes.push(Array.from(chunk));
          return chunk.byteLength;
        },
        write(chunk: Uint8Array) {
          writes.push(Array.from(chunk));
          return Promise.resolve(Math.min(3, chunk.byteLength));
        },
        close() {},
        isTerminal() {
          return false;
        },
      } as Stderr);

      const writer = stderr.writable.getWriter();
      await writer.write(new Uint8Array([4, 5, 6, 7]));
      await writer.close();

      assertEquals(writes, [
        [4, 5, 6, 7],
        [7],
      ]);
    },
  );
});
