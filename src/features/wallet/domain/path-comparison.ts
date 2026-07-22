import type { BitcoinNetwork } from "./bitcoin.ts";
import {
  derivationPresetPath,
  exploreDerivation,
  type DerivationPreset,
} from "./derivation-explorer.ts";

export type PathComparisonRow = Readonly<{
  preset: DerivationPreset;
  standard: string;
  network: string;
  scriptType: string;
  path: string;
  address: string;
  publicKey: string;
  extendedPublicKey: string;
}>;

export type PathComparisonResult = Readonly<{
  bitcoinNetwork: BitcoinNetwork;
  account: number;
  change: 0 | 1;
  index: number;
  rows: readonly PathComparisonRow[];
}>;

const PRESETS: readonly DerivationPreset[] = ["bip44", "bip49", "bip84", "bip86", "ethereum"];

export function compareStandardPaths(input: Readonly<{
  mnemonic: string;
  passphrase: string;
  bitcoinNetwork: BitcoinNetwork;
  account?: number;
  change?: 0 | 1;
  index?: number;
}>): PathComparisonResult {
  const account = input.account ?? 0;
  const change = input.change ?? 0;
  const index = input.index ?? 0;

  const rows = PRESETS.map((preset): PathComparisonRow => {
    const path = derivationPresetPath(preset, {
      network: input.bitcoinNetwork,
      account,
      change,
      index,
    });
    const result = exploreDerivation({
      mnemonic: input.mnemonic,
      passphrase: input.passphrase,
      path,
    });

    if (!result.address) throw new Error(`Не удалось получить адрес для ${preset}.`);

    return {
      preset,
      standard: result.standard,
      network: result.network,
      scriptType: result.scriptType,
      path: result.normalizedPath,
      address: result.address,
      publicKey: result.publicKey,
      extendedPublicKey: result.extendedPublicKey,
    };
  });

  return { bitcoinNetwork: input.bitcoinNetwork, account, change, index, rows };
}

export function comparisonToJson(result: PathComparisonResult): string {
  return JSON.stringify(result, null, 2);
}

export function comparisonToCsv(result: PathComparisonResult): string {
  const header = ["preset", "standard", "network", "scriptType", "path", "address", "publicKey", "extendedPublicKey"];
  const rows = result.rows.map((row) => [
    row.preset,
    row.standard,
    row.network,
    row.scriptType,
    row.path,
    row.address,
    row.publicKey,
    row.extendedPublicKey,
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}
