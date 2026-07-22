import { buildDerivationPath } from "./derivation-path.ts";

export type NetworkId = "bitcoin" | "ethereum";
export type DerivationMode = "bip44-account" | "wallet-address";

export type DerivationPreset = Readonly<{
  id: string;
  network: NetworkId;
  title: string;
  description: string;
  path: string;
}>;

export const DERIVATION_PRESETS: readonly DerivationPreset[] = [
  {
    id: "ethereum-wallet-address",
    network: "ethereum",
    title: "Ethereum · адрес кошелька",
    description: "Совместимая с MetaMask последовательность адресов.",
    path: "m/44'/60'/0'/0/0",
  },
  {
    id: "ethereum-bip44-account",
    network: "ethereum",
    title: "Ethereum · BIP44 account",
    description: "Отдельный hardened account по стандартной структуре BIP44.",
    path: "m/44'/60'/0'/0/0",
  },
  {
    id: "bitcoin-native-segwit",
    network: "bitcoin",
    title: "Bitcoin · Native SegWit",
    description: "BIP84, адреса bc1q…",
    path: "m/84'/0'/0'/0/0",
  },
  {
    id: "bitcoin-taproot",
    network: "bitcoin",
    title: "Bitcoin · Taproot",
    description: "BIP86, адреса bc1p…",
    path: "m/86'/0'/0'/0/0",
  },
] as const;

export function createEthereumPath(mode: DerivationMode, index: number): string {
  return mode === "bip44-account"
    ? buildDerivationPath([
        { index: 44, hardened: true },
        { index: 60, hardened: true },
        { index, hardened: true },
        { index: 0, hardened: false },
        { index: 0, hardened: false },
      ])
    : buildDerivationPath([
        { index: 44, hardened: true },
        { index: 60, hardened: true },
        { index: 0, hardened: true },
        { index: 0, hardened: false },
        { index, hardened: false },
      ]);
}
