// Copyright 2023 Im-Beast. MIT license.
// deno-lint-ignore-file ban-types no-explicit-any
import { BoxObject } from "../canvas/box.ts";
import { Component, type DrawnObjects } from "../component.ts";
import type { EmitterEvent } from "@nick/tui/event-emitter";

/**
 * Component for creating simple non-interactive box
 *
 * @example
 * ```ts
 * new Box({
 *  parent: tui,
 *  theme: {
 *    base: crayon.bgBlue,
 *  },
 *  rectangle: {
 *    column: 1,
 *    row: 1,
 *    height: 5,
 *    width: 10,
 *  },
 *  zIndex: 0,
 * });
 * ```
 */
export class Box<
  TDrawnObjects extends DrawnObjects = {},
  TSubComponents extends Record<string, Component> = Record<string, Component>,
  TEventsRecord extends Record<string, EmitterEvent<any[]>> = {},
> extends Component<
  TDrawnObjects & { box: BoxObject },
  TSubComponents,
  TEventsRecord
> {
  override draw(): void {
    super.draw();

    const box = new BoxObject({
      canvas: this.tui.canvas,
      view: this.view,
      style: this.style,
      zIndex: this.zIndex,
      rectangle: this.rectangle,
    });

    this.drawnObjects.box = box;
    box.draw();
  }
}
