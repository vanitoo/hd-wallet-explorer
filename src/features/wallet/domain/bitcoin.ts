import { HDKey } from "@scure/bip32";
import { base58, bech32, bech32m } from "@scure/base";
import { mnemonicToSeedSync } from "@scure/bip39";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { ripemd160 } from "@noble/hashes/legacy.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { inspectMnemonic } from "./ethereum.ts";

export type BitcoinType = "legacy" | "nested-segwit" | "native-segwit" | "taproot";
export type BitcoinNetwork = "mainnet" | "testnet";
export type BitcoinResult = Readonly<{
  address: string;
  publicKey: string;
  privateKey: string;
  wif: string;
}>;

const ORDER = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141");
const PURPOSE: Record<BitcoinType, number> = {
  legacy: 44,
  "nested-segwit": 49,
  "native-segwit": 84,
  taproot: 86,
};

export function bitcoinPath(
  type: BitcoinType,
  network: BitcoinNetwork,
  account: number,
  change: 0 | 1,
  index: number,
) {
  for (const value of [account, index]) {
    if (!Number.isInteger(value) || value < 0 || value > 0x7fffffff) {
      throw new Error("Индекс должен быть целым от 0 до 2147483647.");
    }
  }

  return `m/${PURPOSE[type]}'/${network === "mainnet" ? 0 : 1}'/${account}'/${change}/${index}`;
}

export function deriveBitcoin(
  input: Readonly<{
    mnemonic: string;
    passphrase: string;
    path: string;
    network: BitcoinNetwork;
    type: BitcoinType;
  }>,
): BitcoinResult {
  const validation = inspectMnemonic(input.mnemonic);
  if (!validation.valid) throw new Error(validation.message);

  const prefix = `m/${PURPOSE[input.type]}'/${input.network === "mainnet" ? 0 : 1}'/`;
  if (!input.path.startsWith(prefix)) {
    throw new Error(`Путь должен начинаться с ${prefix}`);
  }

  const seed = mnemonicToSeedSync(
    validation.normalized,
    input.passphrase.normalize("NFKD"),
  );
  const root = HDKey.fromMasterSeed(seed);
  const child = root.derive(input.path);

  try {
    if (!child.privateKey) throw new Error("Приватный ключ не получен.");
    const publicKey = secp256k1.getPublicKey(child.privateKey, true);

    return {
      address: deriveAddress(publicKey, child.privateKey, input.network, input.type),
      publicKey: toHex(publicKey),
      privateKey: toHex(child.privateKey),
      wif: encodeWif(child.privateKey, input.network),
    };
  } finally {
    seed.fill(0);
    root.wipePrivateData();
    child.wipePrivateData();
  }
}

function deriveAddress(
  publicKey: Uint8Array,
  privateKey: Uint8Array,
  network: BitcoinNetwork,
  type: BitcoinType,
) {
  const publicKeyHash = hash160(publicKey);

  if (type === "legacy") {
    return base58Check(concat(Uint8Array.of(network === "mainnet" ? 0 : 0x6f), publicKeyHash));
  }

  if (type === "nested-segwit") {
    const redeemScript = concat(Uint8Array.of(0, 20), publicKeyHash);
    return base58Check(
      concat(
        Uint8Array.of(network === "mainnet" ? 5 : 0xc4),
        hash160(redeemScript),
      ),
    );
  }

  const humanReadablePart = network === "mainnet" ? "bc" : "tb";
  if (type === "native-segwit") {
    return bech32.encode(humanReadablePart, [0, ...bech32.toWords(publicKeyHash)], 90);
  }

  const outputKey = taprootOutputKey(privateKey);
  return bech32m.encode(humanReadablePart, [1, ...bech32m.toWords(outputKey)], 90);
}

function taprootOutputKey(privateKey: Uint8Array) {
  const publicKey = secp256k1.getPublicKey(privateKey, true);
  const xOnlyPublicKey = publicKey.slice(1);
  let secret = bytesToBigInt(privateKey);

  if (publicKey[0] === 3) secret = ORDER - secret;

  const tagHash = sha256(new TextEncoder().encode("TapTweak"));
  const tweak = bytesToBigInt(sha256(concat(tagHash, tagHash, xOnlyPublicKey)));
  if (tweak >= ORDER) throw new Error("Некорректный Taproot tweak.");

  const outputSecret = (secret + tweak) % ORDER;
  if (outputSecret === BigInt(0)) throw new Error("Некорректный Taproot key.");

  return secp256k1.getPublicKey(bigIntToBytes(outputSecret), true).slice(1);
}

function encodeWif(privateKey: Uint8Array, network: BitcoinNetwork) {
  return base58Check(
    concat(
      Uint8Array.of(network === "mainnet" ? 0x80 : 0xef),
      privateKey,
      Uint8Array.of(1),
    ),
  );
}

function base58Check(payload: Uint8Array) {
  return base58.encode(concat(payload, sha256(sha256(payload)).slice(0, 4)));
}

function hash160(value: Uint8Array) {
  return ripemd160(sha256(value));
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

function toHex(value: Uint8Array) {
  return Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function bytesToBigInt(value: Uint8Array) {
  return BigInt(`0x${toHex(value)}`);
}

function bigIntToBytes(value: bigint) {
  const hex = value.toString(16).padStart(64, "0");
  return Uint8Array.from(hex.match(/.{2}/gu) ?? [], (pair) => Number.parseInt(pair, 16));
}
