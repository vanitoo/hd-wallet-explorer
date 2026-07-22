import assert from "node:assert/strict";
import test from "node:test";
import { bitcoinPath, deriveBitcoin } from "../domain/bitcoin.ts";

const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

test("BIP84 path", () => {
  assert.equal(bitcoinPath("native-segwit", "mainnet", 0, 0, 0), "m/84'/0'/0'/0/0");
});

test("BIP84 vector", () => {
  assert.equal(
    deriveBitcoin({
      mnemonic,
      passphrase: "",
      path: "m/84'/0'/0'/0/0",
      network: "mainnet",
      type: "native-segwit",
    }).address,
    "bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu",
  );
});

test("BIP86 vector", () => {
  assert.equal(
    deriveBitcoin({
      mnemonic,
      passphrase: "",
      path: "m/86'/0'/0'/0/0",
      network: "mainnet",
      type: "taproot",
    }).address,
    "bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr",
  );
});
