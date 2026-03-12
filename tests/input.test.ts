// Copyright 2023 Im-Beast. MIT license.

import { decodeBuffer } from "../src/input/mod.ts";
import { decodeKey } from "../src/input/keyboard.ts";
import { decodeMouseSGR, decodeMouseVT_UTF8 } from "../src/input/mouse.ts";
import { assertEquals, assertExists } from "./deps.ts";

const encoder = new TextEncoder();

Deno.test("input decoders", async (t) => {
  await t.step(
    "decodeKey() handles control, meta, shift and special keys",
    () => {
      const ctrlA = decodeKey(new Uint8Array([1]), "\x01");
      assertEquals(ctrlA.key, "a");
      assertEquals(ctrlA.ctrl, true);
      assertEquals(ctrlA.meta, false);
      assertEquals(ctrlA.shift, false);

      const metaShiftA = decodeKey(new Uint8Array([27, 65]), "\x1bA");
      assertEquals(metaShiftA.key, "A");
      assertEquals(metaShiftA.ctrl, false);
      assertEquals(metaShiftA.meta, true);
      assertEquals(metaShiftA.shift, true);

      const ctrlUp = decodeKey(encoder.encode("\x1b[1;5A"), "\x1b[1;5A");
      assertEquals(ctrlUp.key, "up");
      assertEquals(ctrlUp.ctrl, true);
      assertEquals(ctrlUp.meta, false);
      assertEquals(ctrlUp.shift, false);
    },
  );

  await t.step("decodeMouseSGR() decodes press and scroll events", () => {
    const press = decodeMouseSGR(
      encoder.encode("\x1b[<0;3;4M"),
      "\x1b[<0;3;4M",
    );
    assertExists(press);
    if (!("button" in press)) {
      throw new Error("Expected a mouse press event");
    }
    assertEquals(press.button, 0);
    assertEquals(press.release, false);
    assertEquals(press.drag, false);
    assertEquals(press.x, 2);
    assertEquals(press.y, 3);

    const scroll = decodeMouseSGR(
      encoder.encode("\x1b[<65;5;6M"),
      "\x1b[<65;5;6M",
    );
    assertExists(scroll);
    if (!("scroll" in scroll)) {
      throw new Error("Expected a mouse scroll event");
    }
    assertEquals(scroll.scroll, 1);
    assertEquals(scroll.x, 4);
    assertEquals(scroll.y, 5);
  });

  await t.step("decodeMouseVT_UTF8() decodes VT mouse events", () => {
    const code = "\x1b[M" + String.fromCharCode(0, 0o41 + 2, 0o41 + 4);
    const event = decodeMouseVT_UTF8(encoder.encode(code), code);

    assertExists(event);
    if (!("button" in event)) {
      throw new Error("Expected a mouse press event");
    }
    assertEquals(event.button, 0);
    assertEquals(event.release, false);
    assertEquals(event.drag, false);
    assertEquals(event.x, 2);
    assertEquals(event.y, 4);
  });

  await t.step("decodeBuffer() splits chained escape sequences", () => {
    const events = [];

    for (const event of decodeBuffer(encoder.encode("\x1b[A\x1b[B"))) {
      events.push({
        key: event.key,
        ctrl: event.ctrl,
        meta: event.meta,
        shift: event.shift,
      });
    }

    assertEquals(events, [
      { key: "up", ctrl: false, meta: false, shift: false },
      { key: "down", ctrl: false, meta: false, shift: false },
    ]);
  });
});
