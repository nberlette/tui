// Copyright 2023 Im-Beast. MIT license.

import {
  emptyStyle,
  hierarchizeTheme,
  replaceEmptyStyle,
  Theme,
} from "../src/theme.ts";
import {
  assertEquals,
  assertNotStrictEquals,
  assertStrictEquals,
} from "./deps.ts";

Deno.test("theme.ts", async (t) => {
  await t.step("emptyStyle() returns the original text", () => {
    assertEquals(emptyStyle("hello"), "hello");
  });

  await t.step(
    "replaceEmptyStyle() only replaces the exact emptyStyle reference",
    () => {
      const replacement = (text: string) => `[${text}]`;
      const custom = (text: string) => text.toUpperCase();

      assertStrictEquals(
        replaceEmptyStyle(emptyStyle, replacement),
        replacement,
      );
      assertStrictEquals(replaceEmptyStyle(custom, replacement), custom);
    },
  );

  await t.step("hierarchizeTheme() fills missing states recursively", () => {
    const base = (text: string) => `base:${text}`;
    const focused = (text: string) => `focused:${text}`;
    const theme = hierarchizeTheme(
      {
        base,
        focused,
        nested: {
          base,
        },
      } as Partial<Theme> & { nested: Partial<Theme> },
    ) as Theme & {
      nested: Theme;
    };

    assertStrictEquals(theme.base, base);
    assertStrictEquals(theme.disabled, base);
    assertStrictEquals(theme.focused, focused);
    assertStrictEquals(theme.active, focused);
    assertStrictEquals(theme.nested.base, base);
    assertStrictEquals(theme.nested.focused, base);
    assertStrictEquals(theme.nested.active, base);
    assertStrictEquals(theme.nested.disabled, base);
  });

  await t.step("Theme factories return distinct empty themes", () => {
    const empty = Theme.empty();
    const defaults = Theme.default();

    assertNotStrictEquals(empty, defaults);
    assertEquals(empty.base("x"), "x");
    assertEquals(defaults.focused("x"), "x");
  });
});
