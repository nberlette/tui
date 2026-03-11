// Copyright 2023 Im-Beast. MIT license.

import {
  CLEAR_SCREEN,
  DISABLE_MOUSE,
  ENABLE_MOUSE,
  HIDE_CURSOR,
  moveCursor,
  SHOW_CURSOR,
  USE_PRIMARY_BUFFER,
  USE_SECONDARY_BUFFER,
} from "../../src/utils/ansi_codes.ts";
import { assertEquals } from "../deps.ts";

Deno.test("utils/ansi_codes.ts", async (t) => {
  await t.step("moveCursor() uses 1-based terminal coordinates", () => {
    assertEquals(moveCursor(0, 0), "\x1b[1;1H");
    assertEquals(moveCursor(4, 9), "\x1b[5;10H");
  });

  await t.step("exports the expected ANSI constants", () => {
    assertEquals(ENABLE_MOUSE.endsWith("h"), true);
    assertEquals(DISABLE_MOUSE.endsWith("l"), true);
    assertEquals(HIDE_CURSOR, "\x1b[?25l");
    assertEquals(SHOW_CURSOR, "\x1b[?25h");
    assertEquals(CLEAR_SCREEN, "\x1b[2J");
    assertEquals(USE_SECONDARY_BUFFER, "\x1b[?1049h");
    assertEquals(USE_PRIMARY_BUFFER, "\x1b[?1049l");
  });
});
