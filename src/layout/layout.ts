// Copyright 2023 Im-Beast. MIT license.
import type { Signal, SignalOfObject } from "../signals/signal.ts";
import type { Rectangle } from "../types.ts";

export interface LayoutOptions<T extends string> {
  /** Position and size of Layout */
  rectangle: Rectangle | SignalOfObject<Rectangle>;
  /** Arrangement of elements on layout */
  pattern: T[] | Signal<T[]>;
  /** Horizontal gap between elements */
  gapX?: number | Signal<number>;
  /** Vertical gap between elements */
  gapY?: number | Signal<number>;
}

export interface LayoutElement<T extends string> {
  name: T;
  unitLength: number;
  rectangle: Signal<Rectangle>;
}

export abstract class Layout<
  K extends string,
> {
  abstract rectangle: Signal<Rectangle>;
  abstract gapX: Signal<number>;
  abstract gapY: Signal<number>;

  abstract pattern: unknown;
  abstract elements: unknown[];
  abstract elementNameToIndex: Map<K, number>;

  abstract element(name: K): Signal<Rectangle>;
  abstract updatePattern(): void;
  abstract updateElements(): void;

  constructor() {
    if (new.target === Layout) {
      const cause = new Error("Cannot construct abstract class: Layout");
      Error.captureStackTrace?.(cause, Layout);
      cause.stack; // force stack trace generation
      throw new TypeError("Illegal constructor", { cause });
    }
  }

  get rect(): Signal<Rectangle> {
    return this.rectangle;
  }
}
