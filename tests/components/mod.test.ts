// Copyright 2023 Im-Beast. MIT license.

import * as components from "../../src/components/mod.ts";
import { assertEquals } from "../deps.ts";

Deno.test("components/mod.ts exports", () => {
  assertEquals(typeof components.Box, "function");
  assertEquals(typeof components.Text, "function");
  assertEquals(typeof components.Button, "function");
  assertEquals(typeof components.Table, "function");
});
