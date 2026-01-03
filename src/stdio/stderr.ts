// Copyright 2025 Nicholas Berlette. MIT license.
// Copyright 2018-2025 the Deno authors. MIT license.

import { isDeno, isNodeLike } from "../utils/runtime.ts";

// @ts-types="npm:@types/node@22/process"
import p from "node:process";

/**
 * Represents the `stderr` device, which can be used to write directly to
 * `/dev/stderr`.
 *
 * @category I/O
 */
export interface Stderr {
  /**
   * Write the contents of the array buffer (`p`) to `stderr`.
   *
   * Resolves to the number of bytes written.
   *
   * **It is not guaranteed that the full buffer will be written in a single
   * call.**
   *
   * ```ts
   * const encoder = new TextEncoder();
   * const data = encoder.encode("Hello world");
   * const bytesWritten = await Deno.stderr.write(data); // 11
   * ```
   *
   * @category I/O
   */
  write(p: Uint8Array): Promise<number>;

  /**
   * Synchronously write the contents of the array buffer (`p`) to `stderr`.
   *
   * Returns the number of bytes written.
   *
   * **It is not guaranteed that the full buffer will be written in a single
   * call.**
   *
   * ```ts
   * const encoder = new TextEncoder();
   * const data = encoder.encode("Hello world");
   * const bytesWritten = Deno.stderr.writeSync(data); // 11
   * ```
   */
  writeSync(p: Uint8Array): number;

  /**
   * Closes `stderr`, freeing the resource.
   *
   * ```ts
   * Deno.stderr.close();
   * ```
   */
  close(): void;

  /** A writable stream interface to `stderr`. */
  readonly writable: WritableStream<Uint8Array>;

  /**
   * Checks if `stderr` is a TTY (terminal).
   *
   * ```ts
   * // This example is system and context specific
   * Deno.stderr.isTerminal(); // true
   * ```
   *
   * @category I/O
   */
  isTerminal(): boolean;
}

const { assign, defineProperty } = Object;

export class Stderr {
  constructor(impl?: Stderr) {
    if (!impl) {
      if (isDeno()) return Deno.stderr;
      if (isNodeLike()) {
        const encoder = new TextEncoder();
        const stderr = p.stderr;
        impl = {} as Stderr;
        impl.writeSync = (b) => {
          const buf = typeof b === "string" ? encoder.encode(b) : b;
          stderr.write(buf);
          return buf.byteLength;
        };
        impl.isTerminal = () => stderr.isTTY;
      } else {
        throw new Error("No Stderr implementation available");
      }
    }

    assign(this, impl);
    this.writeSync = this.writeSync.bind(impl);
    this.write ??= (p) => Promise.resolve(this.writeSync(p));
    this.write = this.write.bind(impl);
    this.close ??= () => {};
    this.close = this.close.bind(impl);
    this.isTerminal ??= () => false;
    this.isTerminal = this.isTerminal.bind(impl);

    defineProperty(this, "writable", {
      get() {
        if (impl && "writable" in impl) {
          return impl.writable;
        } else {
          return new WritableStream<Uint8Array>({
            write: async (chunk) => {
              for (
                let n = 0;
                n < chunk.byteLength;
                n += await this.write(chunk.subarray(n))
              );
            },
          });
        }
      },
      set() {},
      configurable: true,
      enumerable: true,
    });
  }
}
