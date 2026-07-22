import assert from "node:assert/strict";
import test from "node:test";
import { derivationPresetPath, exploreDerivation } from "../domain/derivation-explorer.ts";

const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

test("builds standard Bitcoin and Ethereum preset paths", () => {
  assert.equal(derivationPresetPath("bip44"), "m/44'/0'/0'/0/0");
  assert.equal(derivationPresetPath("bip84", { network: "testnet", account: 2, change: 1, index: 7 }), "m/84'/1'/2'/1/7");
  assert.equal(derivationPresetPath("ethereum", { account: 1, index: 3 }), "m/44'/60'/1'/0/3");
});

test("normalizes hardened markers and explains a BIP84 path", () => {
  const result = exploreDerivation({ mnemonic, passphrase: "", path: "m/84H/0h/0'/0/0" });
  assert.equal(result.normalizedPath, "m/84'/0'/0'/0/0");
  assert.equal(result.standard, "BIP84");
  assert.equal(result.network, "Bitcoin mainnet");
  assert.equal(result.scriptType, "P2WPKH");
  assert.match(result.address ?? "", /^bc1q/u);
  assert.equal(result.levels[0].label, "Purpose");
  assert.equal(result.levels[0].hardened, true);
  assert.equal(result.levels[3].label, "Change / branch");
});

test("derives an Ethereum address from the standard path", () => {
  const result = exploreDerivation({ mnemonic, passphrase: "", path: "m/44'/60'/0'/0/0" });
  assert.equal(result.standard, "Ethereum BIP44");
  assert.equal(result.network, "Ethereum");
  assert.match(result.address ?? "", /^0x[0-9A-Fa-f]{40}$/u);
});

test("supports custom BIP32 paths without inventing an address type", () => {
  const result = exploreDerivation({ mnemonic, passphrase: "", path: "m/0'/1/2'" });
  assert.equal(result.standard, "Custom BIP32");
  assert.equal(result.address, undefined);
  assert.ok(result.publicKey.length > 0);
  assert.match(result.extendedPublicKey, /^xpub/u);
});

test("rejects invalid indexes and invalid mnemonic", () => {
  assert.throws(() => derivationPresetPath("bip86", { index: -1 }), /Index/u);
  assert.throws(() => exploreDerivation({ mnemonic: "not a mnemonic", passphrase: "", path: "m/44'/0'/0'/0/0" }), /12, 15, 18, 21 или 24/u);
});
