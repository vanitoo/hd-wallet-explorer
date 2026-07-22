import { HDKey } from "@scure/bip32";
import { mnemonicToSeedSync, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { keccak_256 } from "@noble/hashes/sha3.js";

const ETHEREUM_PATH_PREFIX = "m/44'/60'";

export type EthereumDerivationResult = Readonly<{
  path: string;
  address: string;
  publicKey: string;
  privateKey: string;
}>;

export type MnemonicValidationResult =
  | Readonly<{ valid: true; normalized: string; wordCount: number }>
  | Readonly<{ valid: false; normalized: string; wordCount: number; message: string }>;

export function normalizeMnemonic(value: string): string {
  return value
    .normalize("NFKD")
    .trim()
    .toLowerCase()
    .split(/\s+/u)
    .filter(Boolean)
    .join(" ");
}

export function inspectEnglishMnemonic(value: string): MnemonicValidationResult {
  const normalized = normalizeMnemonic(value);
  const wordCount = normalized ? normalized.split(" ").length : 0;

  if (![12, 15, 18, 21, 24].includes(wordCount)) {
    return {
      valid: false,
      normalized,
      wordCount,
      message: "BIP39-фраза должна содержать 12, 15, 18, 21 или 24 слова.",
    };
  }

  if (!validateMnemonic(normalized, wordlist)) {
    return {
      valid: false,
      normalized,
      wordCount,
      message: "Слова или контрольная сумма BIP39 не совпадают с английским словарём.",
    };
  }

  return { valid: true, normalized, wordCount };
}

export function deriveEthereumAccount(input: Readonly<{
  mnemonic: string;
  passphrase?: string;
  path: string;
}>): EthereumDerivationResult {
  const validation = inspectEnglishMnemonic(input.mnemonic);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  assertEthereumPath(input.path);

  const seed = mnemonicToSeedSync(
    validation.normalized,
    (input.passphrase ?? "").normalize("NFKD"),
  );
  const root = HDKey.fromMasterSeed(seed);
  const child = root.derive(input.path);
  const privateKey = child.privateKey;

  try {
    if (!privateKey) {
      throw new Error("Для выбранного пути не удалось получить приватный ключ.");
    }

    const uncompressedPublicKey = secp256k1.getPublicKey(privateKey, false);
    const addressBytes = keccak_256(uncompressedPublicKey.slice(1)).slice(-20);
    const lowercaseAddress = bytesToHex(addressBytes);

    return {
      path: input.path,
      address: toChecksumAddress(lowercaseAddress),
      publicKey: `0x${bytesToHex(uncompressedPublicKey)}`,
      privateKey: `0x${bytesToHex(privateKey)}`,
    };
  } finally {
    seed.fill(0);
    root.wipePrivateData();
    child.wipePrivateData();
  }
}

function assertEthereumPath(path: string): void {
  if (!path.startsWith(`${ETHEREUM_PATH_PREFIX}/`) && path !== ETHEREUM_PATH_PREFIX) {
    throw new Error("Для Ethereum путь должен начинаться с m/44'/60'.");
  }
}

export function toChecksumAddress(address: string): string {
  const lowercase = address.replace(/^0x/u, "").toLowerCase();
  if (!/^[0-9a-f]{40}$/u.test(lowercase)) {
    throw new Error("Ethereum-адрес должен содержать 40 шестнадцатеричных символов.");
  }

  const hash = bytesToHex(keccak_256(new TextEncoder().encode(lowercase)));
  let checksum = "";
  for (let index = 0; index < lowercase.length; index += 1) {
    const character = lowercase[index];
    checksum += Number.parseInt(hash[index], 16) >= 8 ? character.toUpperCase() : character;
  }
  return `0x${checksum}`;
}

function bytesToHex(value: Uint8Array): string {
  return Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
