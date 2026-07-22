import { HDKey } from "@scure/bip32";
import { mnemonicToSeedSync } from "@scure/bip39";
import { deriveBitcoin, type BitcoinNetwork, type BitcoinType } from "./bitcoin.ts";
import { parseDerivationPath, type DerivationPath } from "./derivation-path.ts";
import { deriveEthereum, inspectMnemonic } from "./ethereum.ts";

export type DerivationPreset = "bip44" | "bip49" | "bip84" | "bip86" | "ethereum";

export type DerivationLevel = Readonly<{
  position: number;
  label: string;
  value: number;
  hardened: boolean;
}>;

export type DerivationExplorerResult = Readonly<{
  normalizedPath: string;
  standard: string;
  network: string;
  scriptType: string;
  address?: string;
  publicKey: string;
  extendedPublicKey: string;
  levels: readonly DerivationLevel[];
}>;

const PRESET_PURPOSE: Record<Exclude<DerivationPreset, "ethereum">, number> = {
  bip44: 44,
  bip49: 49,
  bip84: 84,
  bip86: 86,
};

export function derivationPresetPath(
  preset: DerivationPreset,
  options: Readonly<{ network?: BitcoinNetwork; account?: number; change?: 0 | 1; index?: number }> = {},
): string {
  const account = options.account ?? 0;
  const change = options.change ?? 0;
  const index = options.index ?? 0;
  validateIndex(account, "Account");
  validateIndex(index, "Index");

  if (preset === "ethereum") return `m/44'/60'/${account}'/0/${index}`;
  const network = options.network ?? "mainnet";
  return `m/${PRESET_PURPOSE[preset]}'/${network === "mainnet" ? 0 : 1}'/${account}'/${change}/${index}`;
}

export function exploreDerivation(input: Readonly<{
  mnemonic: string;
  passphrase: string;
  path: string;
}>): DerivationExplorerResult {
  const mnemonic = inspectMnemonic(input.mnemonic);
  if (!mnemonic.valid) throw new Error(mnemonic.message);

  const parsed = parseDerivationPath(input.path);
  const classification = classifyPath(parsed);
  const seed = mnemonicToSeedSync(mnemonic.normalized, input.passphrase.normalize("NFKD"));
  const root = HDKey.fromMasterSeed(seed);
  const child = root.derive(parsed.normalized);

  try {
    if (!child.publicKey) throw new Error("Не удалось получить публичный ключ для указанного пути.");

    let address: string | undefined;
    if (classification.kind === "bitcoin") {
      address = deriveBitcoin({
        mnemonic: mnemonic.normalized,
        passphrase: input.passphrase,
        path: parsed.normalized,
        network: classification.network,
        type: classification.type,
      }).address;
    } else if (classification.kind === "ethereum") {
      address = deriveEthereum({ mnemonic: mnemonic.normalized, passphrase: input.passphrase, path: parsed.normalized }).address;
    }

    return {
      normalizedPath: parsed.normalized,
      standard: classification.standard,
      network: classification.networkLabel,
      scriptType: classification.scriptType,
      address,
      publicKey: toHex(child.publicKey),
      extendedPublicKey: child.publicExtendedKey,
      levels: describeLevels(parsed),
    };
  } finally {
    seed.fill(0);
    root.wipePrivateData();
    child.wipePrivateData();
  }
}

type Classification =
  | Readonly<{ kind: "bitcoin"; standard: string; network: BitcoinNetwork; networkLabel: string; type: BitcoinType; scriptType: string }>
  | Readonly<{ kind: "ethereum"; standard: string; networkLabel: string; scriptType: string }>
  | Readonly<{ kind: "generic"; standard: string; networkLabel: string; scriptType: string }>;

function classifyPath(path: DerivationPath): Classification {
  const [purpose, coin] = path.segments;
  if (!purpose || !coin) return { kind: "generic", standard: "Custom BIP32", networkLabel: "Не определена", scriptType: "Не определён" };

  if (purpose.hardened && coin.hardened && purpose.index === 44 && coin.index === 60) {
    return { kind: "ethereum", standard: "Ethereum BIP44", networkLabel: "Ethereum", scriptType: "EVM account" };
  }

  const bitcoinTypes: Record<number, { standard: string; type: BitcoinType; scriptType: string }> = {
    44: { standard: "BIP44", type: "legacy", scriptType: "P2PKH" },
    49: { standard: "BIP49", type: "nested-segwit", scriptType: "P2SH-P2WPKH" },
    84: { standard: "BIP84", type: "native-segwit", scriptType: "P2WPKH" },
    86: { standard: "BIP86", type: "taproot", scriptType: "P2TR" },
  };
  const bitcoin = bitcoinTypes[purpose.index];
  if (purpose.hardened && coin.hardened && bitcoin && (coin.index === 0 || coin.index === 1)) {
    const network: BitcoinNetwork = coin.index === 0 ? "mainnet" : "testnet";
    return { kind: "bitcoin", ...bitcoin, network, networkLabel: `Bitcoin ${network}` };
  }

  return { kind: "generic", standard: "Custom BIP32", networkLabel: "Не определена", scriptType: "Не определён" };
}

function describeLevels(path: DerivationPath): DerivationLevel[] {
  const labels = ["Purpose", "Coin type", "Account", "Change / branch", "Address index"];
  return path.segments.map((segment, position) => ({
    position,
    label: labels[position] ?? `Level ${position + 1}`,
    value: segment.index,
    hardened: segment.hardened,
  }));
}

function validateIndex(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 0x7fffffff) {
    throw new Error(`${label} должен быть целым числом от 0 до 2147483647.`);
  }
}

function toHex(value: Uint8Array): string {
  return Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
