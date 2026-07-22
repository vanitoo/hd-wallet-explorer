import assert from "node:assert/strict";
import test from "node:test";
import {
  DerivationPathError,
  formatDerivationPath,
  parseDerivationPath,
} from "../domain/derivation-path.ts";
import { createEthereumPath } from "../domain/presets.ts";

test("normalizes hardened suffixes", () => {
  const parsed = parseDerivationPath("m/44h/60H/0'/0/1000");
  assert.equal(formatDerivationPath(parsed), "m/44'/60'/0'/0/1000");
});

test("supports relative paths", () => {
  const parsed = parseDerivationPath("0/15'");
  assert.equal(parsed.absolute, false);
  assert.equal(formatDerivationPath(parsed), "0/15'");
});

test("rejects empty segments", () => {
  assert.throws(() => parseDerivationPath("m/44'//0"), DerivationPathError);
});

test("rejects indexes outside the BIP32 range", () => {
  assert.throws(() => parseDerivationPath("m/2147483648"), /от 0 до 2147483647/);
});

test("builds a MetaMask-style address index path", () => {
  assert.equal(createEthereumPath("wallet-address", 1000), "m/44'/60'/0'/0/1000");
});

test("builds a hardened BIP44 account path", () => {
  assert.equal(createEthereumPath("bip44-account", 1000), "m/44'/60'/1000'/0/0");
});
