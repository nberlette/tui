// Copyright 2023 Im-Beast. MIT license.

import * as mod from "../mod.ts";
import { assertEquals } from "./deps.ts";

Deno.test("mod.ts exports", () => {
  assertEquals(typeof mod.Tui, "function");
  assertEquals(typeof mod.Canvas, "function");
  assertEquals(typeof mod.Signal, "function");
  assertEquals(typeof mod.handleInput, "function");
});
