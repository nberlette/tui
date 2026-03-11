// Copyright 2023 Im-Beast. MIT license.
import { performance } from "../utils/performance.ts";
import { type Computable, Computed } from "./computed.ts";
import { Flusher } from "./flusher.ts";
import type { Dependency, LazyDependant } from "./types.ts";

// TODO: Tests

export interface LazyComputedOptions {
  interval: number;
  flusher: Flusher;
}

/**
 * LazyComputed is a type of signal that depends on other signals and updates
 * when any of them changes. Be aware of its caveats, however, as it can delay
 * updates to avoid too many of them in a short time.
 *
 * - If time between updates is smaller than given interval, it is delayed.
 * - If given a `Flusher`, it will update after `Flusher.flush()` is called.
 * - Both interval and `Flusher` might be set at the same time.
 *
 * @example
 * ```ts
 * const multiplicand = new Signal(1);
 * const multiplier = new Signal(2);
 * const product = new LazyComputed(
 *   () => multiplicand.value * multiplier.value,
 *   16,
 * );
 *
 * console.log(product.value); // 2
 *
 * // Dependency tracking is asynchronous (see `dependency_tracking.ts`)
 * await Promise.resolve(); // wait for next tick
 *
 * multiplicand.value = 2;
 * console.log(product.value); // => 2
 *
 * multiplier.value = 7;
 * console.log(product.value); // => 2
 *
 * // wait until the timeout of LazyComputed gets executed
 * setTimeout(() => console.log(product.value), 16); // => 14
 * ```
 */
export class LazyComputed<T> extends Computed<T> implements LazyDependant {
  timeout?: number;
  interval?: number;
  flusher?: Flusher;
  #updateCallback?: () => void;

  lastFired: number;

  constructor(computable: Computable<T>, interval: number);
  constructor(computable: Computable<T>, flusher: Flusher);
  constructor(computable: Computable<T>, options: LazyComputedOptions);
  constructor(
    computable: Computable<T>,
    option: LazyComputedOptions | number | Flusher,
  ) {
    super(computable);

    if (option instanceof Flusher) {
      this.flusher = option;
    } else if (typeof option === "object") {
      this.flusher = option.flusher;
      this.interval = option.interval;
      this.#updateCallback = () => this.update(this);
    } else {
      this.interval = option;
      this.#updateCallback = () => this.update(this);
    }

    this.lastFired = performance.now();
  }

  override update(cause: Dependency): void {
    const { flusher, interval } = this;

    if (cause === this.flusher) {
      super.update(cause);
      this.lastFired = performance.now();
      return;
    }

    flusher?.depend(this);

    if (interval) {
      const timeDifference = performance.now() - this.lastFired;
      if (timeDifference < interval) {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(this.#updateCallback!, timeDifference);
      } else {
        super.update(cause);
        this.lastFired = performance.now();
      }
    }
  }
}
