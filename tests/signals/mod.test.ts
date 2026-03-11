// Copyright 2023 Im-Beast. MIT license.

import * as signals from "../../src/signals/mod.ts";
import { assertEquals } from "../deps.ts";

Deno.test("signals/mod.ts exports", () => {
  assertEquals(typeof signals.Signal, "function");
  assertEquals(typeof signals.Computed, "function");
  assertEquals(typeof signals.Effect, "function");
  assertEquals(typeof signals.Flusher, "function");
});
