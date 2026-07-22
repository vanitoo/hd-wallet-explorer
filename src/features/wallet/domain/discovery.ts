import type { ScannedAddressRow } from "./scanner.ts";
import { scanAddressRows } from "./scanner.ts";
import { deriveWatchOnlyRange, inspectWatchKey } from "./watch-only.ts";

export type DiscoveryBranch = Readonly<{
  change: 0 | 1;
  label: "External" | "Change";
  rows: ScannedAddressRow[];
  used: number;
  errors: number;
}>;

export type DiscoveryResult = Readonly<{
  network: "mainnet" | "testnet";
  branches: DiscoveryBranch[];
  checked: number;
  used: number;
  errors: number;
  balanceSats: bigint;
}>;

export async function discoverWatchOnly(input: Readonly<{
  extendedPublicKey: string;
  endpoint: string;
  addressGap: number;
  maxAddresses: number;
  retries?: number;
  timeoutMs?: number;
  requestDelayMs?: number;
  signal?: AbortSignal;
  onProgress?: (completed: number, total: number, row: ScannedAddressRow, change: 0 | 1) => void;
}>): Promise<DiscoveryResult> {
  if (!Number.isInteger(input.addressGap) || input.addressGap < 1 || input.addressGap > 100) throw new Error("Address gap должен быть от 1 до 100.");
  if (!Number.isInteger(input.maxAddresses) || input.maxAddresses < input.addressGap || input.maxAddresses > 1000) throw new Error("Максимум адресов должен быть от address gap до 1000.");
  const info = inspectWatchKey(input.extendedPublicKey);
  const branches: DiscoveryBranch[] = [];
  let completed = 0;
  const total = input.maxAddresses * 2;

  for (const change of [0, 1] as const) {
    const source = deriveWatchOnlyRange({ extendedPublicKey: input.extendedPublicKey, change, start: 0, count: input.maxAddresses });
    const rows = await scanAddressRows({
      chain: "bitcoin",
      endpoint: input.endpoint,
      rows: source,
      gapLimit: input.addressGap,
      retries: input.retries,
      timeoutMs: input.timeoutMs,
      requestDelayMs: input.requestDelayMs,
      signal: input.signal,
      onProgress: (_branchCompleted, _branchTotal, row) => {
        completed += 1;
        input.onProgress?.(completed, total, row, change);
      },
    });
    branches.push({
      change,
      label: change === 0 ? "External" : "Change",
      rows,
      used: rows.filter((row) => row.status === "used").length,
      errors: rows.filter((row) => row.status === "error").length,
    });
  }

  const all = branches.flatMap((branch) => branch.rows);
  return {
    network: info.network,
    branches,
    checked: all.length,
    used: all.filter((row) => row.status === "used").length,
    errors: all.filter((row) => row.status === "error").length,
    balanceSats: all.reduce((sum, row) => sum + parseBitcoinBalance(row.balance), 0n),
  };
}

export function parseBitcoinBalance(value: string): bigint {
  const match = value.match(/^(-?\d+)(?:\.(\d+))? BTC$/u);
  if (!match) return 0n;
  const fraction = (match[2] ?? "").padEnd(8, "0").slice(0, 8);
  return BigInt(match[1]) * 100_000_000n + BigInt(fraction || "0") * (match[1].startsWith("-") ? -1n : 1n);
}

export function formatBitcoinSats(value: bigint): string {
  const whole = value / 100_000_000n;
  const fraction = (value % 100_000_000n).toString().padStart(8, "0").replace(/0+$/u, "");
  return `${whole}${fraction ? `.${fraction}` : ""} BTC`;
}
