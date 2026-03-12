// Copyright 2023 Im-Beast. MIT license.

import * as stdio from "../../src/stdio/mod.ts";
import { assertEquals } from "../deps.ts";

Deno.test("stdio/mod.ts exports", () => {
  assertEquals(typeof stdio.Stdin, "function");
  assertEquals(typeof stdio.Stdout, "function");
  assertEquals(typeof stdio.Stderr, "function");
  assertEquals(typeof stdio.consoleSize, "function");
});
