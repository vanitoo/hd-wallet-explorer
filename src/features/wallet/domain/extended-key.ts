import { base58 } from "@scure/base";
import { sha256 } from "@noble/hashes/sha2.js";
import type { BitcoinNetwork, BitcoinType } from "./bitcoin.ts";

export type ExtendedKeyPrefix =
  | "xpub" | "ypub" | "zpub" | "tpub" | "upub" | "vpub"
  | "xprv" | "yprv" | "zprv" | "tprv" | "uprv" | "vprv";

export type ExtendedKeyKind = "public" | "private";

export type ExtendedKeyInfo = Readonly<{
  prefix: ExtendedKeyPrefix;
  kind: ExtendedKeyKind;
  network: BitcoinNetwork;
  type: Exclude<BitcoinType, "taproot">;
  version: number;
  depth: number;
  parentFingerprint: string;
  childNumber: number;
  chainCode: string;
  keyData: string;
}>;

type VersionInfo = Readonly<{
  prefix: ExtendedKeyPrefix;
  kind: ExtendedKeyKind;
  network: BitcoinNetwork;
  type: Exclude<BitcoinType, "taproot">;
}>;

const VERSION_INFO: Record<number, VersionInfo> = {
  0x0488b21e: { prefix: "xpub", kind: "public", network: "mainnet", type: "legacy" },
  0x049d7cb2: { prefix: "ypub", kind: "public", network: "mainnet", type: "nested-segwit" },
  0x04b24746: { prefix: "zpub", kind: "public", network: "mainnet", type: "native-segwit" },
  0x043587cf: { prefix: "tpub", kind: "public", network: "testnet", type: "legacy" },
  0x044a5262: { prefix: "upub", kind: "public", network: "testnet", type: "nested-segwit" },
  0x045f1cf6: { prefix: "vpub", kind: "public", network: "testnet", type: "native-segwit" },
  0x0488ade4: { prefix: "xprv", kind: "private", network: "mainnet", type: "legacy" },
  0x049d7878: { prefix: "yprv", kind: "private", network: "mainnet", type: "nested-segwit" },
  0x04b2430c: { prefix: "zprv", kind: "private", network: "mainnet", type: "native-segwit" },
  0x04358394: { prefix: "tprv", kind: "private", network: "testnet", type: "legacy" },
  0x044a4e28: { prefix: "uprv", kind: "private", network: "testnet", type: "nested-segwit" },
  0x045f18bc: { prefix: "vprv", kind: "private", network: "testnet", type: "native-segwit" },
};

const STANDARD_PUBLIC_VERSION: Record<BitcoinNetwork, number> = {
  mainnet: 0x0488b21e,
  testnet: 0x043587cf,
};

export function parseExtendedKey(value: string): ExtendedKeyInfo {
  const payload = decodeExtendedKey(value);
  const version = readUint32(payload, 0);
  const versionInfo = VERSION_INFO[version];
  if (!versionInfo) {
    throw new Error(`Неизвестные version bytes расширенного ключа: 0x${version.toString(16).padStart(8, "0")}.`);
  }

  const depth = payload[4];
  const parentFingerprintBytes = payload.slice(5, 9);
  const childNumber = readUint32(payload, 9);
  const chainCode = payload.slice(13, 45);
  const keyData = payload.slice(45, 78);

  if (depth === 0 && (childNumber !== 0 || parentFingerprintBytes.some((byte) => byte !== 0))) {
    throw new Error("Master extended key с depth 0 должен иметь нулевые parent fingerprint и child number.");
  }
  if (chainCode.every((byte) => byte === 0)) throw new Error("Chain code не может состоять только из нулей.");

  if (versionInfo.kind === "public") {
    if (keyData[0] !== 0x02 && keyData[0] !== 0x03) {
      throw new Error("Extended public key должен содержать сжатый secp256k1 public key.");
    }
  } else if (keyData[0] !== 0x00) {
    throw new Error("Extended private key должен содержать приватный key data с нулевым префиксом.");
  }

  return {
    ...versionInfo,
    version,
    depth,
    parentFingerprint: toHex(parentFingerprintBytes),
    childNumber,
    chainCode: toHex(chainCode),
    keyData: toHex(keyData),
  };
}

export function normalizeExtendedPublicKey(value: string): string {
  const info = parseExtendedKey(value);
  if (info.kind !== "public") throw new Error("Расширенный ключ не является публичным.");
  const payload = decodeExtendedKey(value);
  writeUint32(payload, 0, STANDARD_PUBLIC_VERSION[info.network]);
  return encodeExtendedKey(payload);
}

function decodeExtendedKey(value: string): Uint8Array {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Расширенный ключ не указан.");

  let decoded: Uint8Array;
  try {
    decoded = base58.decode(trimmed);
  } catch {
    throw new Error("Расширенный ключ имеет неверный Base58-формат.");
  }
  if (decoded.length !== 82) throw new Error(`Расширенный ключ должен содержать 82 байта, получено ${decoded.length}.`);

  const payload = decoded.slice(0, 78);
  const checksum = decoded.slice(78);
  const expected = sha256(sha256(payload)).slice(0, 4);
  if (!equalBytes(checksum, expected)) throw new Error("Контрольная сумма Base58Check расширенного ключа не совпадает.");
  return payload;
}

function encodeExtendedKey(payload: Uint8Array): string {
  return base58.encode(concat(payload, sha256(sha256(payload)).slice(0, 4)));
}

function readUint32(value: Uint8Array, offset: number): number {
  return ((value[offset] * 0x1000000) + (value[offset + 1] << 16) + (value[offset + 2] << 8) + value[offset + 3]) >>> 0;
}

function writeUint32(value: Uint8Array, offset: number, number: number): void {
  value[offset] = (number >>> 24) & 0xff;
  value[offset + 1] = (number >>> 16) & 0xff;
  value[offset + 2] = (number >>> 8) & 0xff;
  value[offset + 3] = number & 0xff;
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  return left.length === right.length && left.every((byte, index) => byte === right[index]);
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function toHex(value: Uint8Array): string {
  return Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
