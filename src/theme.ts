// Copyright 2023 Im-Beast. MIT license.

/** Function that's supposed to return styled text given string as parameter */
export type Style = (text: string) => string;

/** Used as placeholder style when one is not supplied, returns the input */
export function emptyStyle(text: string): string {
  return text;
}

/** Returns {replacement} if {style} is an {emptyStyle} otherwise returns {style} back */
export function replaceEmptyStyle(style: Style, replacement: Style): Style {
  return style === emptyStyle ? replacement : style;
}

/** Applies default values to properties (lower one hierarchy or `emptyStyle`) that aren't set */
export function hierarchizeTheme(input: Partial<Theme> = {}): Theme {
  input.base ??= emptyStyle;
  input.disabled ??= input.base;
  input.focused ??= input.base;
  input.active ??= input.focused;

  const output = input as Theme & Record<string, Theme>;
  for (const key in output) {
    if (
      key === "base" ||
      key === "active" ||
      key === "focused" ||
      key === "disabled" ||
      output === output[key]
    ) continue;
    output[key] = hierarchizeTheme(output[key]);
  }

  return output;
}

/** Base theme used to style components, can be expanded upon */
export class Theme {
  static empty(): Theme {
    return new Theme();
  }

  static default(): Theme {
    return new Theme();
  }

  /** Default style */
  base: Style;

  /** Style when component is focused */
  focused: Style;

  /** Style when component is active */
  active: Style;

  /** Style when component is disabled */
  disabled: Style;

  constructor(base?: Style, focused?: Style, active?: Style, disabled?: Style) {
    this.base = base ?? emptyStyle;
    this.active = active ?? emptyStyle;
    this.focused = focused ?? emptyStyle;
    this.disabled = disabled ?? emptyStyle;
  }
}
