// Copyright 2023 Im-Beast. MIT license.

import * as canvas from "../../src/canvas/mod.ts";
import { assertEquals } from "../deps.ts";

Deno.test("canvas/mod.ts exports", () => {
  assertEquals(typeof canvas.BoxObject, "function");
  assertEquals(typeof canvas.TextObject, "function");
  assertEquals(typeof canvas.Canvas, "function");
  assertEquals(typeof canvas.Renderable, "function");
});
