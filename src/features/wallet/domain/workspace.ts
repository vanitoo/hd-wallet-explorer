import type { WatchProfile } from "./watch-only.ts";

export type WorkspaceAddress = Readonly<{
  id: string;
  chain: "bitcoin" | "ethereum";
  address: string;
  label: string;
  note: string;
  favorite: boolean;
  createdAt: string;
}>;

export type DiscoverySnapshot = Readonly<{
  id: string;
  profileName: string;
  extendedPublicKey: string;
  network: "mainnet" | "testnet";
  checked: number;
  used: number;
  errors: number;
  balanceSats: number;
  addresses: ReadonlyArray<{
    address: string;
    branch: "External" | "Change";
    index: number;
    balance: string;
    transactionCount: number;
    status: "used" | "unused" | "error";
  }>;
  createdAt: string;
}>;

export type WalletWorkspace = Readonly<{
  version: 1;
  name: string;
  profiles: WatchProfile[];
  discoveries: DiscoverySnapshot[];
  addresses: WorkspaceAddress[];
  exportedAt: string;
}>;

export const PROFILE_STORAGE_KEY = "hd-wallet-explorer.watch-only-profiles.v1";
export const DISCOVERY_STORAGE_KEY = "hd-wallet-explorer.discovery-snapshots.v1";
export const ADDRESS_STORAGE_KEY = "hd-wallet-explorer.workspace-addresses.v1";

export function parseStoredArray<T>(value: string | null, guard: (item: unknown) => item is T): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter(guard) : [];
  } catch {
    return [];
  }
}

export function isWorkspaceAddress(value: unknown): value is WorkspaceAddress {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<WorkspaceAddress>;
  return typeof item.id === "string" && (item.chain === "bitcoin" || item.chain === "ethereum") &&
    typeof item.address === "string" && typeof item.label === "string" && typeof item.note === "string" &&
    typeof item.favorite === "boolean" && typeof item.createdAt === "string";
}

export function isDiscoverySnapshot(value: unknown): value is DiscoverySnapshot {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<DiscoverySnapshot>;
  return typeof item.id === "string" && typeof item.profileName === "string" &&
    typeof item.extendedPublicKey === "string" && (item.network === "mainnet" || item.network === "testnet") &&
    typeof item.checked === "number" && typeof item.used === "number" && typeof item.errors === "number" &&
    typeof item.balanceSats === "number" && Array.isArray(item.addresses) && typeof item.createdAt === "string";
}

export function createWorkspaceAddress(input: Readonly<{ chain: "bitcoin" | "ethereum"; address: string; label: string; note: string }>): WorkspaceAddress {
  const address = input.address.trim();
  if (!address) throw new Error("Укажите публичный адрес.");
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    chain: input.chain,
    address,
    label: input.label.trim() || "Без названия",
    note: input.note.trim(),
    favorite: false,
    createdAt: new Date().toISOString(),
  };
}

export function buildWorkspace(name: string, profiles: WatchProfile[], discoveries: DiscoverySnapshot[], addresses: WorkspaceAddress[]): WalletWorkspace {
  return { version: 1, name: name.trim() || "HD Wallet Workspace", profiles, discoveries, addresses, exportedAt: new Date().toISOString() };
}

export function parseWorkspace(value: string): WalletWorkspace {
  let parsed: unknown;
  try { parsed = JSON.parse(value); } catch { throw new Error("Файл workspace не является корректным JSON."); }
  if (!parsed || typeof parsed !== "object") throw new Error("Некорректный формат workspace.");
  const data = parsed as Partial<WalletWorkspace>;
  if (data.version !== 1 || typeof data.name !== "string" || !Array.isArray(data.profiles) || !Array.isArray(data.discoveries) || !Array.isArray(data.addresses)) {
    throw new Error("Неподдерживаемая структура workspace.");
  }
  return data as WalletWorkspace;
}
