import assert from "node:assert/strict";
import test from "node:test";
import {
  deriveEthereumAccount,
  inspectEnglishMnemonic,
  toChecksumAddress,
} from "../domain/ethereum.ts";

const HARDHAT_MNEMONIC = "test test test test test test test test test test test junk";

test("validates a known BIP39 mnemonic", () => {
  const result = inspectEnglishMnemonic(HARDHAT_MNEMONIC);
  assert.equal(result.valid, true);
  assert.equal(result.wordCount, 12);
});

test("rejects an invalid BIP39 checksum", () => {
  const result = inspectEnglishMnemonic("test test test test test test test test test test test test");
  assert.equal(result.valid, false);
});

test("derives the first Hardhat Ethereum account", () => {
  const result = deriveEthereumAccount({
    mnemonic: HARDHAT_MNEMONIC,
    path: "m/44'/60'/0'/0/0",
  });

  assert.equal(result.address, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  assert.equal(
    result.privateKey,
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  );
});

test("creates an EIP-55 checksum address", () => {
  assert.equal(
    toChecksumAddress("52908400098527886e0f7030069857d2e4169ee7"),
    "0x52908400098527886E0F7030069857D2E4169EE7",
  );
});
