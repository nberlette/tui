// Copyright 2023 Im-Beast. MIT license.
import type { Signal } from "./signals/signal.ts";
import { signalify } from "./signals/signalify.ts";
import type { Offset, Rectangle } from "./types.ts";

interface ViewOptions {
  offset?: Offset;
  maxOffset?: Offset;
  rectangle: Rectangle;
}

export class View {
  offset: Signal<Offset>;
  maxOffset: Signal<Offset>;
  rectangle: Signal<Rectangle>;

  constructor(options: ViewOptions) {
    this.rectangle = signalify(options.rectangle, { deepObserve: true });
    this.offset = signalify(options.offset ?? { columns: 0, rows: 0 }, {
      deepObserve: true,
    });
    this.maxOffset = signalify(options.maxOffset ?? { columns: 0, rows: 0 }, {
      deepObserve: true,
    });
  }
}
