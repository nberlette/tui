/**
 * Type defining terminal's (console) available size measured in columns and
 * rows. This is the return type of {@linkcode getConsoleSize}.
 */
export interface ConsoleSize {
  columns: number;
  rows: number;
}
