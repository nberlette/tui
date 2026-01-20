// Copyright 2023 Im-Beast. MIT license.
// deno-lint-ignore-file ban-types
import type { Component, ComponentOptions } from "../component.ts";
import { Box } from "./box.ts";
import type { BoxObject } from "../canvas/box.ts";
import { Label, type LabelAlign, type LabelRectangle } from "./label.ts";
import type { Signal, SignalOfObject } from "../signals/mod.ts";
import { signalify } from "../signals/signalify.ts";

const centerAlign: LabelAlign = {
  horizontal: "center",
  vertical: "center",
};

export interface ButtonOptions extends ComponentOptions {
  label?: {
    text: string | Signal<string>;
    align?: LabelAlign | SignalOfObject<LabelAlign>;
  };
}

export interface ButtonLabel {
  text: Signal<string>;
  align: Signal<LabelAlign>;
}

/**
 * Component for creating interactive buttons in the terminal.
 *
 * @example
 * ```ts
 * new Button({
 *  parent: tui,
 *  label: { text: "click\nme" },
 *  theme: {
 *    base: crayon.bgGreen,
 *    focused: crayon.bgLightGreen,
 *    active: crayon.bgYellow,
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
export class Button<
  TSubComponents extends Record<string, Component> = {},
> extends Box<{ box: BoxObject }, TSubComponents & { label?: Label }> {
  label: ButtonLabel = { text: signalify(""), align: signalify(centerAlign) };

  constructor(options: ButtonOptions) {
    super(options);

    const { label } = options;

    if (label?.text) {
      this.label.text = signalify(label.text);
      if (label?.align) {
        this.label.align = signalify(label.align);
      }
    }

    this.label.text.subscribe(this.#updateLabelSubcomponent);
  }

  override draw(): void {
    super.draw();
    this.#updateLabelSubcomponent();
  }

  override interact(method: "mouse" | "keyboard"): void {
    const interactionInterval = Date.now() - this.lastInteraction.time;

    this.state.value = this.state.peek() === "focused" &&
        (interactionInterval < 500 || method === "keyboard")
      ? "active"
      : "focused";

    super.interact(method);
  }

  #updateLabelSubcomponent = () => {
    if (!this.label.text.value) {
      this.subComponents.label?.destroy();
    } else if (!this.subComponents.label) {
      const label = new Label({
        parent: this,
        theme: this.theme,
        zIndex: this.zIndex,
        rectangle: this.rectangle as Signal<LabelRectangle>,
        overwriteRectangle: true,
        text: this.label.text,
        align: this.label.align,
      });

      label.state = this.state;
      label.style = this.style;

      label.subComponentOf = this;
      this.subComponents.label = label;
    }
  };
}
