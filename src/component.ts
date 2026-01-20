// Copyright 2023 Im-Beast. MIT license.
// deno-lint-ignore-file no-explicit-any

import type { Tui } from "./tui.ts";
import { hierarchizeTheme, type Style, type Theme } from "./theme.ts";
import { type EmitterEvent, EventEmitter } from "./event_emitter.ts";
import type { Rectangle } from "./types.ts";
import { SortedArray } from "./utils/sorted_array.ts";
import type { DrawObject } from "./canvas/draw_object.ts";
import type { View } from "./view.ts";
import type { InputEventRecord } from "./input_reader/mod.ts";
import { Computed, Signal, type SignalOfObject } from "./signals/mod.ts";
import { signalify } from "./signals/signalify.ts";

export interface ComponentOptions {
  tui?: Tui;
  theme: Partial<Theme>;
  parent: Component | Tui;
  zIndex: number | Signal<number>;
  visible?: boolean | Signal<boolean>;
  rectangle: Rectangle | SignalOfObject<Rectangle>;
  view?: View | undefined | SignalOfObject<View | undefined>;
}

/** Type defining last interaction component experienced */
export interface Interaction {
  time: number;
  method: "keyboard" | "mouse" | undefined;
}

/** Possible states of a component */
export type ComponentState = keyof Theme;

export type DrawnObjects = Record<string, DrawObject | DrawObject[]>;

export type AnyComponent = Component<
  DrawnObjects,
  Record<string, Component<Record<string, any>>>
>;

type BaseEvents = { destroy: EmitterEvent<[Component]> } & InputEventRecord;

export class Component<
  TDrawnObjects extends DrawnObjects = Record<
    string,
    DrawObject | DrawObject[]
  >,
  TSubComponents extends Record<string, Component> = Record<
    string,
    AnyComponent
  >,
  TEvents extends Record<string, EmitterEvent<any[]>> = Record<
    string,
    EmitterEvent<any[]>
  >,
> extends EventEmitter<TEvents & BaseEvents> {
  #drawn: boolean;
  #destroyed: boolean;

  subComponentOf?: Component;

  visible: Signal<boolean>;
  state: Signal<ComponentState>;
  view: Signal<View | undefined>;
  zIndex: Signal<number>;
  rectangle: SignalOfObject<Rectangle>;
  style: Signal<Style>;

  tui: Tui;
  theme: Theme;
  parent: Component | Tui;
  children: SortedArray<Component>;
  drawnObjects: TDrawnObjects;
  subComponents: TSubComponents;
  lastInteraction: Interaction;

  constructor(options: ComponentOptions) {
    super();

    this.#drawn = false;
    this.#destroyed = false;
    this.parent = options.parent;

    const { parent } = this;
    const tui = this.tui = options.tui ??
      ("tui" in parent ? parent.tui : parent);

    this.parent.children.push(this);
    this.children = new SortedArray();
    this.drawnObjects = {} as TDrawnObjects;
    this.subComponents = {} as TSubComponents;

    this.lastInteraction = {
      time: -1,
      method: undefined,
    };

    this.view = signalify(options.view);
    this.zIndex = signalify(options.zIndex);
    this.visible = signalify(options.visible ?? true);
    this.rectangle = signalify(options.rectangle, {
      deepObserve: true,
      watchObjectIndex: true,
    });

    this.visible.subscribe((visible) => {
      if (this.#destroyed) return;

      if (!this.#drawn && visible) {
        if (!this.tui.children.includes(this)) return;
        this.draw();
      } else {
        this.changeDrawnObjectVisibility(visible, false);
      }

      for (const child of this.children) {
        child.visible.value = visible;
      }
    });

    this.state = new Signal<ComponentState>("base");
    this.theme = hierarchizeTheme(options.theme);
    this.style = new Computed(() => {
      const state = this.state.value;
      return this.theme[state];
    });

    tui.on("keyPress", (event) => {
      const state = this.state.peek();
      if (state === "focused" || state === "active") {
        this.emit("keyPress", event);
      }
    });
    tui.on("mouseEvent", (event) => {
      const state = this.state.peek();
      if (state === "focused" || state === "active") {
        this.emit("mouseEvent", event);
      }
    });
    tui.on("mousePress", (event) => {
      const state = this.state.peek();
      if (state === "focused" || state === "active") {
        this.emit("mousePress", event);
      }
    });
    tui.on("mouseScroll", (event) => {
      const state = this.state.peek();
      if (state === "focused" || state === "active") {
        this.emit("mouseScroll", event);
      }
    });

    queueMicrotask(() => {
      this.tui.addChild(this);
    });
  }

  /**
   * Interact with component using mouse/keyboard
   */
  interact(method: "keyboard" | "mouse"): void {
    this.lastInteraction.time = Date.now();
    this.lastInteraction.method = method;
  }

  /**
   * Changes visibility of `drawnObjects` (erases/draws them depending on {visible})
   *
   * If {visible} is set to false and {remove} is set to true it deletes objects from `drawnObjects`
   */
  changeDrawnObjectVisibility(visible: boolean, remove = false): void {
    const { drawnObjects } = this;
    for (const key in drawnObjects) {
      const value = drawnObjects[key];

      if (Array.isArray(value)) {
        for (const object of value) {
          if (visible) object.draw();
          else object.erase();
        }
      } else {
        if (visible) value.draw();
        else value.erase();
      }

      if (remove) delete drawnObjects[key];
    }
  }

  /**
   * Destroys component:
   *  - Disables all listeners
   *  - Removes all `drawnObjects`
   *  - calls `destroy()` on its children
   *  - Removes itself from `subComponentOf.subComponents`
   *  - Removes itself from `parent.children`
   */
  destroy(): void {
    this.emit("destroy", this);
    this.#destroyed = true;

    this.off();
    this.changeDrawnObjectVisibility(false, true);

    const { children } = this.parent;
    children.splice(children.indexOf(this), 1);

    for (const child of this.children) {
      child.destroy();
    }

    const subComponents = this.subComponentOf?.subComponents;
    delete this.subComponentOf;

    if (!subComponents) return;
    for (const index in subComponents) {
      if (subComponents[index] === this) delete subComponents[index];
    }
  }

  /**
   * Draw component
   *
   * If called more than one times it deletes previous `drawnObjects`
   */
  draw(): void {
    this.#drawn = true;
    this.changeDrawnObjectVisibility(false, true);
  }
}
