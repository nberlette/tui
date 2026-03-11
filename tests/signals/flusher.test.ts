// Copyright 2023 Im-Beast. MIT license.

import { Flusher } from "../../src/signals/flusher.ts";
import { assertEquals } from "../deps.ts";

Deno.test("signals/flusher.ts", () => {
  const flusher = new Flusher();
  let updates = 0;
  const dependant = {
    update() {
      ++updates;
    },
  };

  flusher.depend(dependant as never);
  flusher.depend(dependant as never);
  flusher.flush();

  assertEquals(updates, 1);
  assertEquals(flusher.dependants.size, 0);
});
