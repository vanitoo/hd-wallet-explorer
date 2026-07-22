import assert from "node:assert/strict";
import test from "node:test";
import { assertDerivationPathPrefix, formatDerivationPath, parseDerivationPath, validateChildIndex } from "../domain/derivation-path.ts";

test("normalizes apostrophe and h hardened markers", () => {
  assert.equal(parseDerivationPath("m/84h/0H/0'/0/5").normalized, "m/84'/0'/0'/0/5");
});

test("formats structured paths", () => {
  assert.equal(formatDerivationPath([
    { index: 44, hardened: true },
    { index: 0, hardened: true },
    { index: 0, hardened: true },
    { index: 1, hardened: false },
    { index: 7, hardened: false },
  ]), "m/44'/0'/0'/1/7");
});

test("validates path prefixes structurally", () => {
  assert.equal(assertDerivationPathPrefix("m/84h/0h/0h/0/0", "m/84'/0'"), "m/84'/0'/0'/0/0");
  assert.throws(() => assertDerivationPathPrefix("m/44'/0'/0'/0/0", "m/84'/0'"), /начинаться/u);
});

test("rejects invalid paths and child indices", () => {
  assert.throws(() => parseDerivationPath("84'/0'/0'"), /начинаться с m/u);
  assert.throws(() => parseDerivationPath("m/44'//0'"), /пустой сегмент/u);
  assert.throws(() => parseDerivationPath("m/44'/abc"), /Некорректный сегмент/u);
  assert.throws(() => validateChildIndex(-1), /целым числом/u);
  assert.throws(() => validateChildIndex(0x80000000), /2147483647/u);
});
