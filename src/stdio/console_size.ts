import type { ConsoleSize } from "./types.ts";

export type { ConsoleSize };

type Stdio = {
  columns: number;
  rows: number;
  getWindowSize(): [columns: number, rows: number];
};

type Process = {
  stdout: Stdio;
  stderr: Stdio;
  env: Record<string, string | undefined>;
};

const _global: typeof globalThis & { process?: Process } = globalThis;

/**
 * The default console size used as a fallback when the actual size cannot be
 * determined. Used internally by {@linkcode getConsoleSize}.
 *
 * Following established conventions, the default size is 80 columns x 24 rows.
 *
 * @see {@linkcode getConsoleSize} to retrieve the current console size.
 * @category TTY
 */
export const defaultConsoleSize: ConsoleSize = {
  columns: 80,
  rows: 24,
};

export default defaultConsoleSize;

/**
 * Retrieves the current console size (columns and rows) from the environment,
 * with fallbacks for different runtimes. If no size can be determined, the
 * given `defaults` are returned instead (which themselves default to 80x24).
 *
 * This function supports both Node.js and Deno runtimes, with Node.js being
 * the primary target since Deno, Bun, and Node.js all support the same API for
 * `process.stdout.columns` and `process.stdout.rows`.
 *
 * @remarks
 * If the `NodeJS.Process` API is unavailable or incomplete, it will first try
 * to read the `COLUMNS` and `LINES` environment variables as a fallback. In
 * the edge case where the `NodeJS.Process` API is unavailable but the
 * `Deno.consoleSize` API **_is_**, such as in older versions of Deno before
 * the Node compatibility layer, it will use that instead. Finally, if all of
 * the previous attempts still fail to yield a size, the provided `defaults`
 * will be returned as a last resort. The default size is 80 columns x 24 rows,
 * a common standard for terminal emulators, but this can be overridden by
 * passing a custom {@linkcode ConsoleSize} object for the `defaults` param.
 *
 * @param [defaults=defaultConsoleSize] The fallback console size to use if all
 *        other methods fail to determine the console size. Defaults to 80x24.
 * @returns The current console size as a {@linkcode ConsoleSize} object.
 */
export function consoleSize(
  defaults: ConsoleSize = defaultConsoleSize,
): ConsoleSize {
  try {
    if ("process" in _global) {
      const {
        stderr,
        stdout = stderr ?? {} as Stdio,
        env = {},
      } = _global.process ?? {};
      let { columns, rows } = stdout;
      if (!columns || !rows) {
        if (env.COLUMNS != null && env.LINES != null) {
          [columns, rows] = [+env.COLUMNS, +env.LINES];
        } else if (typeof stdout?.getWindowSize === "function") {
          [columns, rows] = stdout.getWindowSize();
        } else {
          [columns, rows] = [80, 24];
        }
      }
      return { columns, rows };
    } else if ("Deno" in _global && _global.Deno?.consoleSize) {
      return _global.Deno.consoleSize();
    }
  } catch { /* ignore */ }
  // Fallback to standard size
  return { ...defaults };
}
