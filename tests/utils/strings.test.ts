// Copyright 2023 Im-Beast. MIT license.

import {
  capitalize,
  characterWidth,
  cropToWidth,
  getMultiCodePointCharacters,
  insertAt,
  isFinalAnsiByte,
  stripStyles,
  textWidth,
  UNICODE_CHAR_REGEXP,
} from "../../src/utils/strings.ts";
import { assertEquals } from "../deps.ts";

const unicodeString = "♥☭👀f🌏g⚠5✌💢✅💛🌻";
const fullWidths = [
  "０",
  "１",
  "２",
  "３",
  "４",
  "ｈ",
  "ｉ",
  "ｊ",
  "ｋ",
  "ｌ",
  "テ",
  "ク",
  "ワ",
];
const halfWidths = ["a", "b", "1", "ą", "ł", "､", "ﾝ", "ｼ"];

Deno.test("utils/strings.ts", async (t) => {
  await t.step("UNICODE_CHAR_REGEXP", () => {
    const unicodeCharacters = unicodeString.match(UNICODE_CHAR_REGEXP)!;

    assertEquals(unicodeString.length, 18);
    assertEquals(unicodeCharacters.length, 13);
  });

  await t.step("insertAt()", () => {
    assertEquals(insertAt("est", 0, "T"), "Test");
    assertEquals(insertAt("test", 4, "!"), "test!");
  });

  await t.step("characterWidth()", () => {
    for (const character of fullWidths) {
      assertEquals(characterWidth(character), 2);
    }

    for (const character of halfWidths) {
      assertEquals(characterWidth(character), 1);
    }
  });

  await t.step("stripStyles()", () => {
    assertEquals(stripStyles("\x1b[32mHello\x1b[0m"), "Hello");
  });

  await t.step("textWidth()", () => {
    assertEquals(textWidth(fullWidths.join("")), fullWidths.length * 2);
    assertEquals(textWidth("Hello"), 5);
  });

  await t.step("getMultiCodePointCharacters()", () => {
    assertEquals(getMultiCodePointCharacters("A👀B"), ["A", "👀", "B"]);
    assertEquals(getMultiCodePointCharacters(""), []);
  });

  await t.step("cropToWidth()", () => {
    assertEquals(cropToWidth("abcdef", 3), "abc");
    assertEquals(cropToWidth("a界b", 2), "a ");
  });

  await t.step("isFinalAnsiByte()", () => {
    assertEquals(isFinalAnsiByte("A"), true);
    assertEquals(isFinalAnsiByte("m"), true);
    assertEquals(isFinalAnsiByte("p"), false);
  });

  await t.step("capitalize()", () => {
    assertEquals(capitalize("hello"), "Hello");
  });
});
