import assert from "node:assert/strict";
import test from "node:test";
import { exploreSeed, maskSecret } from "../domain/seed-explorer.ts";

const MNEMONIC = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

test("matches the official BIP39 seed vector with TREZOR passphrase", () => {
  const result = exploreSeed({ mnemonic: MNEMONIC, passphrase: "TREZOR" });
  assert.equal(result.wordCount, 12);
  assert.equal(result.entropyHex, "00000000000000000000000000000000");
  assert.equal(
    result.seedHex,
    "c55257c360c07c72029aebc1b53c05ed0362ada38ead3e3e9efa3708e53495531f09a6987599d18264c1e1c92f2cf141630c7a3c4ab7c81b2f001698e7463b04",
  );
  assert.match(result.masterXpub, /^xpub/u);
  assert.match(result.masterXprv, /^xprv/u);
  assert.match(result.masterFingerprint, /^[0-9a-f]{8}$/u);
});

test("normalizes mnemonic whitespace", () => {
  const result = exploreSeed({ mnemonic: `  ${MNEMONIC.replaceAll(" ", "  ")}  `, passphrase: "" });
  assert.equal(result.mnemonic, MNEMONIC);
});

test("rejects an invalid mnemonic checksum", () => {
  assert.throws(
    () => exploreSeed({ mnemonic: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon", passphrase: "" }),
    /контрольная сумма|BIP39/u,
  );
});

test("masks secrets by default", () => {
  const masked = maskSecret("1234567890abcdefghijklmnopqrstuvwxyz");
  assert.match(masked, /^12345678/u);
  assert.match(masked, /stuvwxyz$/u);
  assert.notEqual(masked, "1234567890abcdefghijklmnopqrstuvwxyz");
});
