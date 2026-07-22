import { HDKey } from "@scure/bip32";
import { base58, bech32 } from "@scure/base";
import { ripemd160 } from "@noble/hashes/legacy.js";
import { sha256 } from "@noble/hashes/sha2.js";
import type { AddressRow } from "./range.ts";
import type { BitcoinNetwork, BitcoinType } from "./bitcoin.ts";

export type WatchKeyPrefix = "xpub" | "ypub" | "zpub" | "tpub" | "upub" | "vpub";

export type WatchKeyInfo = Readonly<{
  prefix: WatchKeyPrefix;
  network: BitcoinNetwork;
  type: Exclude<BitcoinType, "taproot">;
  depth: number;
  fingerprint: string;
}>;

export type WatchProfile = Readonly<{
  id: string;
  name: string;
  extendedPublicKey: string;
  createdAt: string;
}>;

const VERSION_INFO: Record<number, Omit<WatchKeyInfo, "depth" | "fingerprint">> = {
  0x0488b21e: { prefix: "xpub", network: "mainnet", type: "legacy" },
  0x049d7cb2: { prefix: "ypub", network: "mainnet", type: "nested-segwit" },
  0x04b24746: { prefix: "zpub", network: "mainnet", type: "native-segwit" },
  0x043587cf: { prefix: "tpub", network: "testnet", type: "legacy" },
  0x044a5262: { prefix: "upub", network: "testnet", type: "nested-segwit" },
  0x045f1cf6: { prefix: "vpub", network: "testnet", type: "native-segwit" },
};

const PRIVATE_VERSIONS = new Set([
  0x0488ade4, // xprv
  0x049d7878, // yprv
  0x04b2430c, // zprv
  0x04358394, // tprv
  0x044a4e28, // uprv
  0x045f18bc, // vprv
]);

const STANDARD_VERSION: Record<BitcoinNetwork, number> = {
  mainnet: 0x0488b21e,
  testnet: 0x043587cf,
};

export function inspectWatchKey(value: string): WatchKeyInfo {
  const decoded = decodeExtendedKey(value);
  const version = readUint32(decoded, 0);
  if (PRIVATE_VERSIONS.has(version) || decoded[45] === 0) {
    throw new Error("Расширенный ключ не является публичным: Watch-only не принимает приватные ключи.");
  }
  const info = VERSION_INFO[version];
  if (!info) throw new Error("Поддерживаются xpub, ypub, zpub, tpub, upub и vpub.");
  if (decoded[45] !== 2 && decoded[45] !== 3) throw new Error("Расширенный ключ не является публичным.");
  return {
    ...info,
    depth: decoded[4],
    fingerprint: toHex(decoded.slice(5, 9)),
  };
}

export function deriveWatchOnlyRange(input: Readonly<{
  extendedPublicKey: string;
  change: 0 | 1;
  start: number;
  count: number;
}>): AddressRow[] {
  validateIndex(input.start, "Начальный индекс");
  if (!Number.isInteger(input.count) || input.count < 1 || input.count > 1000) {
    throw new Error("Количество должно быть целым числом от 1 до 1000.");
  }
  if (input.start + input.count - 1 > 0x7fffffff) throw new Error("Диапазон выходит за пределы допустимых индексов.");

  const info = inspectWatchKey(input.extendedPublicKey);
  const normalized = normalizeToStandardExtendedKey(input.extendedPublicKey, info.network);
  const root = HDKey.fromExtendedKey(normalized);
  const branch = root.deriveChild(input.change);

  return Array.from({ length: input.count }, (_, offset) => {
    const index = input.start + offset;
    const child = branch.deriveChild(index);
    if (!child.publicKey) throw new Error(`Не удалось получить публичный ключ для индекса ${index}.`);
    return {
      index,
      path: `${info.prefix}/${input.change}/${index}`,
      address: addressFromPublicKey(child.publicKey, info.network, info.type),
      publicKey: toHex(child.publicKey),
    };
  });
}

export function createWatchProfile(name: string, extendedPublicKey: string): WatchProfile {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Укажите имя watch-only профиля.");
  inspectWatchKey(extendedPublicKey);
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: trimmedName,
    extendedPublicKey: extendedPublicKey.trim(),
    createdAt: new Date().toISOString(),
  };
}

export function parseWatchProfiles(value: string | null): WatchProfile[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isWatchProfile);
  } catch {
    return [];
  }
}

function normalizeToStandardExtendedKey(value: string, network: BitcoinNetwork): string {
  const decoded = decodeExtendedKey(value);
  writeUint32(decoded, 0, STANDARD_VERSION[network]);
  return encodeChecked(decoded);
}

function decodeExtendedKey(value: string): Uint8Array {
  const trimmed = value.trim();
  let decoded: Uint8Array;
  try {
    decoded = base58.decode(trimmed);
  } catch {
    throw new Error("Расширенный публичный ключ имеет неверный Base58-формат.");
  }
  if (decoded.length !== 82) throw new Error("Расширенный публичный ключ должен содержать 78 байт данных.");
  const payload = decoded.slice(0, 78);
  const checksum = decoded.slice(78);
  const expected = sha256(sha256(payload)).slice(0, 4);
  if (!equalBytes(checksum, expected)) throw new Error("Контрольная сумма расширенного ключа не совпадает.");
  return payload;
}

function encodeChecked(payload: Uint8Array): string {
  return base58.encode(concat(payload, sha256(sha256(payload)).slice(0, 4)));
}

function addressFromPublicKey(
  publicKey: Uint8Array,
  network: BitcoinNetwork,
  type: Exclude<BitcoinType, "taproot">,
): string {
  const keyHash = ripemd160(sha256(publicKey));
  if (type === "legacy") {
    return encodeChecked(concat(Uint8Array.of(network === "mainnet" ? 0 : 0x6f), keyHash));
  }
  if (type === "nested-segwit") {
    const redeemScript = concat(Uint8Array.of(0, 20), keyHash);
    const scriptHash = ripemd160(sha256(redeemScript));
    return encodeChecked(concat(Uint8Array.of(network === "mainnet" ? 5 : 0xc4), scriptHash));
  }
  return bech32.encode(network === "mainnet" ? "bc" : "tb", [0, ...bech32.toWords(keyHash)], 90);
}

function isWatchProfile(value: unknown): value is WatchProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<WatchProfile>;
  return typeof profile.id === "string" && typeof profile.name === "string" &&
    typeof profile.extendedPublicKey === "string" && typeof profile.createdAt === "string";
}

function validateIndex(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0 || value > 0x7fffffff) {
    throw new Error(`${label} должен быть целым числом от 0 до 2147483647.`);
  }
}

function readUint32(value: Uint8Array, offset: number) {
  return ((value[offset] * 0x1000000) + (value[offset + 1] << 16) + (value[offset + 2] << 8) + value[offset + 3]) >>> 0;
}

function writeUint32(value: Uint8Array, offset: number, number: number) {
  value[offset] = (number >>> 24) & 0xff;
  value[offset + 1] = (number >>> 16) & 0xff;
  value[offset + 2] = (number >>> 8) & 0xff;
  value[offset + 3] = number & 0xff;
}

function concat(...parts: Uint8Array[]) {
  const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function equalBytes(left: Uint8Array, right: Uint8Array) {
  return left.length === right.length && left.every((byte, index) => byte === right[index]);
}

function toHex(value: Uint8Array) {
  return Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
