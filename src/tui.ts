// Copyright 2023 Im-Beast. MIT license.
import { BoxObject, Canvas } from "./canvas/mod.ts";
import type { Component } from "./component.ts";
import { type EmitterEvent, EventEmitter } from "./event_emitter.ts";
import type { InputEventRecord } from "./input/mod.ts";
import { Computed, type Signal } from "./signals/mod.ts";
import type { Style } from "./theme.ts";
import { type Rectangle, Stdin, Stdout } from "./types.ts";
import {
  HIDE_CURSOR,
  SHOW_CURSOR,
  USE_PRIMARY_BUFFER,
  USE_SECONDARY_BUFFER,
} from "./utils/ansi_codes.ts";
import { consoleSize } from "./stdio/console_size.ts";
import { handleInput } from "./input.ts";
import { handleKeyboardControls, handleMouseControls } from "./controls.ts";

import process from "node:process";

const textEncoder = new TextEncoder();

export interface TuiOptions {
  style?: Style;
  stdin?: Stdin;
  stdout?: Stdout;
  canvas?: Canvas;
  refreshRate?: number;
}

export interface RunOptions {
  /**
   * Enable keyboard input handling
   * @default {false}
   */
  keyboard?: boolean;
  /**
   * Enable mouse input handling
   * @default {false}
   */
  mouse?: boolean;
  /**
   * Enable general input handling
   * @default {false}
   */
  input?: boolean;
  /**
   * Enable dispatching of exit events
   * @default {false}
   */
  dispatch?: boolean;
}

/**
 * Root element of Tui app.
 *
 * This keeps elements running and manages Components as children.
 *
 * @example
 * ```ts
 * const tui = new Tui({
 *   style: crayon.bgBlack,
 *   refreshRate: 1000 / 60,
 * });
 *
 * tui.dispatch();
 * tui.run();
 * ```
 */
export class Tui extends EventEmitter<
  {
    destroy: EmitterEvent<[]>;
  } & InputEventRecord
> {
  stdin: Stdin;
  stdout: Stdout;
  canvas: Canvas;
  rectangle: Signal<Rectangle>;
  style?: Style;
  children: Component[];
  components: Set<Component>;
  drawnObjects: { background?: BoxObject };
  refreshRate: number;

  #nextUpdateTimeout?: number;

  constructor(options: TuiOptions) {
    super();
    this.stdin = options.stdin ?? new Stdin();
    this.stdout = options.stdout ?? new Stdout();
    this.refreshRate = options.refreshRate ?? 1000 / 60;
    this.canvas = options.canvas ?? new Canvas({
      stdout: this.stdout,
      size: consoleSize(),
    });

    this.style = options.style;

    this.drawnObjects = {};
    this.components = new Set();
    this.children = [];

    const tuiRectangle = { column: 0, row: 0, width: 0, height: 0 };
    this.rectangle = new Computed(() => {
      const { columns, rows } = this.canvas.size.value;
      tuiRectangle.width = columns;
      tuiRectangle.height = rows;
      return tuiRectangle;
    });

    const updateCanvasSize = () => {
      const { canvas } = this, { columns, rows } = consoleSize();
      const size = canvas.size.peek();

      if (size.columns !== columns || size.rows !== rows) {
        size.columns = columns;
        size.rows = rows;
      }
    };

    updateCanvasSize();

    if (process.platform === "win32") {
      setInterval(updateCanvasSize, this.refreshRate);
    } else {
      process.on("SIGWINCH", updateCanvasSize);
      process.stdout.on("resize", updateCanvasSize);
      process.stderr.on("resize", updateCanvasSize);
    }
  }

  add(...children: Component[]): this {
    for (const child of children) this.addChild(child);
    return this;
  }

  addChild(child: Component): this {
    this.children.push(child);
    this.components.add(child);

    if (child.visible.peek()) child.draw();
    return this;
  }

  hasChild(child: Component): boolean {
    return this.components.has(child);
  }

  input(enable: boolean = true): this {
    if (enable) handleInput(this);
    return this;
  }

  mouse(enable: boolean = true): this {
    if (enable) handleMouseControls(this);
    return this;
  }

  keyboard(enable: boolean = true): this {
    if (enable) handleKeyboardControls(this);
    return this;
  }

  run(options?: RunOptions): this {
    const {
      input = false,
      mouse = false,
      dispatch = false,
      keyboard = false,
    } = options ?? {};

    if (input) this.input();
    if (mouse) this.mouse();
    if (keyboard) this.keyboard();
    if (dispatch) this.dispatch();

    const {
      style,
      canvas,
      stdout,
      drawnObjects,
      rectangle,
    } = this;

    if (style) {
      const { background } = drawnObjects;
      background?.erase();

      const box = new BoxObject({
        canvas,
        rectangle,
        style,
        zIndex: -1,
      });

      drawnObjects.background = box;
      box.draw();
    }

    stdout.write(textEncoder.encode(USE_SECONDARY_BUFFER + HIDE_CURSOR));

    const updateStep = () => {
      if (this.#nextUpdateTimeout != null) {
        this.#nextUpdateTimeout = clearTimeout(this.#nextUpdateTimeout)!;
      }
      canvas.render();
      this.#nextUpdateTimeout = setTimeout(updateStep, this.refreshRate);
    };
    updateStep();

    return this;
  }

  destroy(): void {
    this.off();
    clearTimeout(this.#nextUpdateTimeout);

    try {
      this.stdin.setRaw(false, { cbreak: false });
    } catch { /* ignore */ }

    this.stdout.write(textEncoder.encode(USE_PRIMARY_BUFFER + SHOW_CURSOR));

    for (const component of this.components) {
      component.destroy();
    }
  }

  dispatch(): this {
    const destroyDispatcher = () => {
      this.emit("destroy");
    };

    if (process.platform.includes("win")) {
      process.on("SIGBREAK", destroyDispatcher);

      this.on("keyPress", ({ key, ctrl }) => {
        if (ctrl && key === "c") destroyDispatcher();
      });
    } else {
      process.on("SIGTERM", destroyDispatcher);
    }

    process.on("SIGINT", destroyDispatcher);

    this.on("destroy", async () => {
      this.destroy();
      await Promise.resolve();
      process.exit(0);
    });

    return this;
  }

  [Symbol.dispose](): void {
    try {
      this.destroy();
    } catch { /* ignore */ }
  }
}
