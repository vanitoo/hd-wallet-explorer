import assert from "node:assert/strict";
import test from "node:test";
import {
  compareStandardPaths,
  comparisonToCsv,
  comparisonToJson,
} from "../domain/path-comparison.ts";

const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

test("compares Bitcoin standards and Ethereum from one seed", () => {
  const result = compareStandardPaths({ mnemonic, passphrase: "", bitcoinNetwork: "mainnet" });
  assert.equal(result.rows.length, 5);
  assert.deepEqual(result.rows.map((row) => row.preset), ["bip44", "bip49", "bip84", "bip86", "ethereum"]);
  assert.match(result.rows[0].address, /^1/u);
  assert.match(result.rows[1].address, /^3/u);
  assert.match(result.rows[2].address, /^bc1q/u);
  assert.match(result.rows[3].address, /^bc1p/u);
  assert.match(result.rows[4].address, /^0x/u);
  assert.equal(new Set(result.rows.map((row) => row.path)).size, 5);
});

test("uses testnet coin type and prefixes for Bitcoin rows", () => {
  const result = compareStandardPaths({ mnemonic, passphrase: "", bitcoinNetwork: "testnet", account: 1, change: 1, index: 2 });
  const bitcoinRows = result.rows.slice(0, 4);
  assert.ok(bitcoinRows.every((row) => row.path.includes("/1'/1'/1/2")));
  assert.match(bitcoinRows[0].address, /^[mn]/u);
  assert.match(bitcoinRows[1].address, /^2/u);
  assert.match(bitcoinRows[2].address, /^tb1q/u);
  assert.match(bitcoinRows[3].address, /^tb1p/u);
  assert.equal(result.rows[4].path, "m/44'/60'/1'/0/2");
});

test("exports public comparison results to JSON and CSV", () => {
  const result = compareStandardPaths({ mnemonic, passphrase: "TREZOR", bitcoinNetwork: "mainnet" });
  const json = comparisonToJson(result);
  const csv = comparisonToCsv(result);
  assert.equal(JSON.parse(json).rows.length, 5);
  assert.match(csv, /"preset","standard","network"/u);
  assert.match(csv, /"bip84"/u);
  assert.doesNotMatch(json, /abandon/u);
  assert.doesNotMatch(json, /TREZOR/u);
  assert.doesNotMatch(csv, /abandon/u);
  assert.doesNotMatch(csv, /TREZOR/u);
});

test("rejects invalid mnemonic and indices", () => {
  assert.throws(() => compareStandardPaths({ mnemonic: "not a seed", passphrase: "", bitcoinNetwork: "mainnet" }), /12, 15, 18, 21 или 24/u);
  assert.throws(() => compareStandardPaths({ mnemonic, passphrase: "", bitcoinNetwork: "mainnet", index: -1 }), /Index/u);
});
