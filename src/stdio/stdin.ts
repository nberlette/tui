// Copyright 2025 Nicholas Berlette. MIT license.
// Copyright 2018-2025 the Deno authors. MIT license.

import { isDeno, isNodeLike } from "../utils/runtime.ts";
import process from "node:process";

/** @category I/O */
export interface SetRawOptions {
  /**
   * The `cbreak` option can be used to indicate that characters that
   * correspond to a signal should still be generated.
   *
   * When disabling raw mode, this option is ignored. This functionality
   * currently only works on Linux and Mac OS.
   */
  cbreak: boolean;
}

/**
 * Represents the `stdin` device, which can be used to read directly from
 * `/dev/stdin`.
 *
 * @category I/O
 */
export interface Stdin {
  /**
   * Read the incoming data from `stdin` into an array buffer (`p`).
   *
   * Resolves to either the number of bytes read during the operation or EOF
   * (`null`) if there was nothing more to read.
   *
   * It is possible for a read to successfully return with `0` bytes. This
   * does not indicate EOF.
   *
   * **It is not guaranteed that the full buffer will be read in a single
   * call.**
   *
   * ```ts
   * // If the text "hello world" is piped into the script:
   * const buf = new Uint8Array(100);
   * const numberOfBytesRead = await Deno.stdin.read(buf); // 11 bytes
   * const text = new TextDecoder().decode(buf);  // "hello world"
   * ```
   *
   * @category I/O
   */
  read(p: Uint8Array): Promise<number | null>;

  /**
   * Synchronously read from the incoming data from `stdin` into an array
   * buffer (`p`).
   *
   * Returns either the number of bytes read during the operation or EOF
   * (`null`) if there was nothing more to read.
   *
   * It is possible for a read to successfully return with `0` bytes. This does
   * not indicate EOF.
   *
   * **It is not guaranteed that the full buffer will be read in a single
   * call.**
   *
   * ```ts
   * // If the text "hello world" is piped into the script:
   * const buf = new Uint8Array(100);
   * const numberOfBytesRead = Deno.stdin.readSync(buf); // 11 bytes
   * const text = new TextDecoder().decode(buf);  // "hello world"
   * ```
   *
   * @category I/O
   */
  readSync(p: Uint8Array): number | null;

  /**
   * Closes `stdin`, freeing the resource.
   *
   * ```ts
   * Deno.stdin.close();
   * ```
   */
  close(): void;

  /** A readable stream interface to `stdin`. */
  readonly readable: ReadableStream<Uint8Array<ArrayBuffer>>;

  /**
   * Set TTY to be under raw mode or not. In raw mode, characters are read and
   * returned as is, without being processed.
   *
   * All special processing of characters by the terminal is disabled,
   * including echoing input characters. Reading from a TTY device in raw mode
   * is faster than reading from a TTY device in canonical mode.
   *
   * ```ts
   * Deno.stdin.setRaw(true, { cbreak: true });
   * ```
   *
   * @category I/O
   */
  setRaw(mode: boolean, options?: SetRawOptions): void;

  /**
   * Checks if `stdin` is a TTY (terminal).
   *
   * ```ts
   * // This example is system and context specific
   * Deno.stdin.isTerminal(); // true
   * ```
   *
   * @category I/O
   */
  isTerminal(): boolean;
}

type StdinImpl = Reshape<
  Partial<Stdin> & Pick<Stdin, "readSync" | "isTerminal" | "close">
>;

type Reshape<T> = Pick<T, keyof T>;

const { assign, defineProperty } = Object;

export class Stdin {
  constructor(impl?: StdinImpl) {
    if (!impl) {
      if (isDeno()) return Deno.stdin;
      if (isNodeLike()) {
        const stdin = process.stdin;
        impl = {} as Stdin;
        impl.readSync = (b) => {
          const buf = stdin.read(b.byteLength);
          if (buf === null) return null;
          b.set(buf);
          return buf.byteLength;
        };
        impl.isTerminal = () => stdin.isTTY;
      } else {
        throw new Error("No Stdin implementation available");
      }
    }
    assign(this, impl);
    this.readSync = this.readSync.bind(impl);
    this.read = (
      this.read ??= (p) => Promise.resolve(this.readSync(p))
    ).bind(impl);
    this.close = (this.close ??= () => {}).bind(impl);
    this.isTerminal = (this.isTerminal ??= () => false).bind(impl);
    defineProperty(this, "readable", {
      get() {
        if (impl && "readable" in impl) {
          return impl.readable;
        } else {
          return new ReadableStream<Uint8Array>({
            pull: async (controller) => {
              const buf = new Uint8Array(1024);
              const n = await this.read(buf);
              if (n === null) {
                controller.close();
              } else {
                controller.enqueue(buf.subarray(0, n));
              }
            },
          });
        }
      },
      configurable: true,
      enumerable: true,
    });
  }
}
