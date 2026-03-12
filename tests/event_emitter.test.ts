// Copyright 2023 Im-Beast. MIT license.

import { type EmitterEvent, EventEmitter } from "../src/event_emitter.ts";
import { assertEquals } from "./deps.ts";

type EventMap = {
  test: EmitterEvent<[]>;
  message: EmitterEvent<[string]>;
  count: EmitterEvent<[number]>;
};

Deno.test("event_emitter.ts", async (t) => {
  await t.step("EventEmitter", () => {
    const emitter = new EventEmitter<EventMap>();
    let passed = false;
    let triage = 0;

    emitter.on("test", () => {
      passed = true;
    });

    emitter.on("test", () => {
      ++triage;
    }, true);

    emitter.emit("test");
    emitter.emit("test");

    assertEquals(passed, true);
    assertEquals(triage, 1);
  });

  await t.step("on() returns a listener cleanup function", () => {
    const emitter = new EventEmitter<EventMap>();
    const values: string[] = [];

    const cleanup = emitter.on("message", (value) => {
      values.push(value);
    });

    emitter.emit("message", "first");
    cleanup();
    emitter.emit("message", "second");

    assertEquals(values, ["first"]);
  });

  await t.step("off() removes listeners by type and globally", () => {
    const emitter = new EventEmitter<EventMap>();
    let testCalls = 0;
    let countCalls = 0;

    emitter.on("test", () => {
      ++testCalls;
    });
    emitter.on("count", () => {
      ++countCalls;
    });

    emitter.off("test");
    emitter.emit("test");
    emitter.emit("count", 1);

    assertEquals(testCalls, 0);
    assertEquals(countCalls, 1);

    emitter.off();
    emitter.emit("count", 2);

    assertEquals(countCalls, 1);
  });
});
