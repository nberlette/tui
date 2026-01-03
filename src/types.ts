// Copyright 2023 Im-Beast. MIT license.
// Copyright 2025 Nicholas Berlette. MIT license.
// Copyright 2018-2025 the Deno authors. MIT license.

export type * from "./stdio/types.ts";

import type { ConsoleSize } from "./stdio/mod.ts";

export { type ConsoleSize, Stderr, Stdin, Stdout } from "./stdio/mod.ts";

/** Type that describes offset */
export interface Offset extends ConsoleSize {}

/** Type that describes empty edge around Rectangle */
export interface Margin {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

/** Type that describes position and size */
export interface Rectangle {
  column: number;
  row: number;
  width: number;
  height: number;
}

/** Generates number types that range from {From} to {To}  */
export type Range<From extends number, To extends number> = number extends From
  ? number
  : _Range<From, To>;

type _Range<From extends number, To extends number, R extends unknown[] = []> =
  R["length"] extends To ? To
    :
      | (R["length"] extends Range<0, From> ? From : R["length"])
      | _Range<From, To, [To, ...R]>;

/** Partial that makes all properties optional, even those within other object properties */
export type DeepPartial<Object, OmitKeys extends keyof Object = never> =
  & {
    [key in Exclude<keyof Object, OmitKeys>]?: Object[key] extends object
      // deno-lint-ignore ban-types
      ? Object[key] extends Function ? Object[key] : DeepPartial<Object[key]>
      : Object[key];
  }
  & {
    [key in OmitKeys]: DeepPartial<Object[key]>;
  };
