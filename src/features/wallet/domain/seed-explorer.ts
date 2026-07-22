import { HDKey } from "@scure/bip32";
import { mnemonicToEntropy, mnemonicToSeedSync, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { inspectMnemonic } from "./ethereum.ts";

export type SeedExplorerResult = Readonly<{
  mnemonic: string;
  wordCount: number;
  entropyHex: string;
  seedHex: string;
  masterFingerprint: string;
  masterXpub: string;
  masterXprv: string;
}>;

export function exploreSeed(input: Readonly<{ mnemonic: string; passphrase: string }>): SeedExplorerResult {
  const inspected = inspectMnemonic(input.mnemonic);
  if (!inspected.valid) throw new Error(inspected.message);
  if (!validateMnemonic(inspected.normalized, wordlist)) throw new Error("Неверная BIP39 mnemonic.");

  const entropy = mnemonicToEntropy(inspected.normalized, wordlist);
  const seed = mnemonicToSeedSync(inspected.normalized, input.passphrase.normalize("NFKD"));
  const root = HDKey.fromMasterSeed(seed);

  try {
    return {
      mnemonic: inspected.normalized,
      wordCount: inspected.wordCount,
      entropyHex: toHex(entropy),
      seedHex: toHex(seed),
      masterFingerprint: root.fingerprint.toString(16).padStart(8, "0"),
      masterXpub: root.publicExtendedKey,
      masterXprv: root.privateExtendedKey,
    };
  } finally {
    seed.fill(0);
    root.wipePrivateData();
  }
}

export function maskSecret(value: string, visibleStart = 8, visibleEnd = 8): string {
  if (value.length <= visibleStart + visibleEnd) return "•".repeat(value.length);
  return `${value.slice(0, visibleStart)}${"•".repeat(Math.min(24, value.length - visibleStart - visibleEnd))}${value.slice(-visibleEnd)}`;
}

function toHex(value: Uint8Array): string {
  return Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
