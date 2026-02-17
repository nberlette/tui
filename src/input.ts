// Copyright 2023 Im-Beast. MIT license.
import type { Tui } from "./tui.ts";
import { emitInputEvents } from "./input/mod.ts";

export * from "./input/mod.ts";

/** Emit input events to Tui  */
export async function handleInput(tui: Tui): Promise<void> {
  await emitInputEvents(tui.stdin, tui, tui.refreshRate);
}
