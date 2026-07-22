import assert from "node:assert/strict";
import test from "node:test";
import { HDKey } from "@scure/bip32";
import { normalizeExtendedPublicKey, parseExtendedKey } from "../domain/extended-key.ts";

const root = HDKey.fromMasterSeed(Uint8Array.from({ length: 32 }, (_, index) => index));

test("parses public extended key metadata", () => {
  const info = parseExtendedKey(root.publicExtendedKey);
  assert.equal(info.prefix, "xpub");
  assert.equal(info.kind, "public");
  assert.equal(info.network, "mainnet");
  assert.equal(info.depth, 0);
  assert.equal(info.parentFingerprint, "00000000");
  assert.equal(info.childNumber, 0);
  assert.equal(info.chainCode.length, 64);
  assert.match(info.keyData, /^(02|03)[0-9a-f]{64}$/u);
});

test("recognizes private extended keys without exposing them to watch-only", () => {
  const info = parseExtendedKey(root.privateExtendedKey);
  assert.equal(info.prefix, "xprv");
  assert.equal(info.kind, "private");
  assert.match(info.keyData, /^00[0-9a-f]{64}$/u);
  assert.throws(() => normalizeExtendedPublicKey(root.privateExtendedKey), /публичным/u);
});

test("rejects malformed and checksum-invalid keys", () => {
  assert.throws(() => parseExtendedKey(""), /не указан/u);
  assert.throws(() => parseExtendedKey("xpub-invalid"), /Base58/u);
  const damaged = `${root.publicExtendedKey.slice(0, -1)}${root.publicExtendedKey.endsWith("1") ? "2" : "1"}`;
  assert.throws(() => parseExtendedKey(damaged), /Base58Check/u);
});

test("normalizes standard public extended keys without changing their value", () => {
  assert.equal(normalizeExtendedPublicKey(root.publicExtendedKey), root.publicExtendedKey);
});
