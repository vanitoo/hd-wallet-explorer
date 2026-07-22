import { HDKey } from "@scure/bip32";
import { base58, bech32 } from "@scure/base";
import { ripemd160 } from "@noble/hashes/legacy.js";
import { sha256 } from "@noble/hashes/sha2.js";
import type { AddressRow } from "./range.ts";
import type { BitcoinNetwork, BitcoinType } from "./bitcoin.ts";
import { normalizeExtendedPublicKey, parseExtendedKey } from "./extended-key.ts";
import { validateChildIndex } from "./derivation-path.ts";

export type WatchKeyPrefix = "xpub" | "ypub" | "zpub" | "tpub" | "upub" | "vpub";

export type WatchKeyInfo = Readonly<{
  prefix: WatchKeyPrefix;
  network: BitcoinNetwork;
  type: Exclude<BitcoinType, "taproot">;
  depth: number;
  fingerprint: string;
  childNumber: number;
  chainCode: string;
  publicKey: string;
}>;

export type WatchProfile = Readonly<{
  id: string;
  name: string;
  extendedPublicKey: string;
  createdAt: string;
}>;

export function inspectWatchKey(value: string): WatchKeyInfo {
  const info = parseExtendedKey(value);
  if (info.kind !== "public") {
    throw new Error("Расширенный ключ не является публичным: Watch-only не принимает приватные ключи.");
  }

  return {
    prefix: info.prefix as WatchKeyPrefix,
    network: info.network,
    type: info.type,
    depth: info.depth,
    fingerprint: info.parentFingerprint,
    childNumber: info.childNumber,
    chainCode: info.chainCode,
    publicKey: info.keyData,
  };
}

export function deriveWatchOnlyRange(input: Readonly<{
  extendedPublicKey: string;
  change: 0 | 1;
  start: number;
  count: number;
}>): AddressRow[] {
  validateChildIndex(input.start, "Начальный индекс");
  if (!Number.isInteger(input.count) || input.count < 1 || input.count > 1000) {
    throw new Error("Количество должно быть целым числом от 1 до 1000.");
  }
  if (input.start + input.count - 1 > 0x7fffffff) throw new Error("Диапазон выходит за пределы допустимых индексов.");

  const info = inspectWatchKey(input.extendedPublicKey);
  const normalized = normalizeExtendedPublicKey(input.extendedPublicKey);
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

function encodeChecked(payload: Uint8Array): string {
  return base58.encode(concat(payload, sha256(sha256(payload)).slice(0, 4)));
}

function isWatchProfile(value: unknown): value is WatchProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<WatchProfile>;
  return typeof profile.id === "string" && typeof profile.name === "string" &&
    typeof profile.extendedPublicKey === "string" && typeof profile.createdAt === "string";
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
