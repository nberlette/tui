// Copyright 2023 Im-Beast. MIT license.

/** Get ANSI escape code for moving cursor to given location */
export function moveCursor(row: number, column: number): string {
  return `\x1b[${row + 1};${column + 1}H`;
}

/** ANSI escape code to enable mouse handling */
export const ENABLE_MOUSE = "\x1b[?1000;1002;1003;1004;1005;1006h" as const;

/** ANSI escape code to disable mouse handling */
export const DISABLE_MOUSE = "\x1b[?1000;1002;1003;1004;1005;1006l" as const;

/** ANSI escape code to hide terminal cursor  */
export const HIDE_CURSOR = "\x1b[?25l" as const;

/** ANSI escape code to show terminal cursor  */
export const SHOW_CURSOR = "\x1b[?25h" as const;

/** ANSI escape code to clear screen  */
export const CLEAR_SCREEN = "\x1b[2J" as const;

/** ANSI escape code to tell terminal to use secondary buffer */
export const USE_SECONDARY_BUFFER = "\x1b[?1049h" as const;

/** ANSI escape code to tell terminal to switch back to primary buffer */
export const USE_PRIMARY_BUFFER = "\x1b[?1049l" as const;
