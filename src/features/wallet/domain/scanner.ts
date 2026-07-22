import type { AddressRow } from "./range.ts";

export type ScanChain = "ethereum" | "bitcoin";
export type ScanStatus = "used" | "unused" | "error";

export type ScannedAddressRow = AddressRow & Readonly<{
  balance: string;
  transactionCount: number;
  status: ScanStatus;
  error?: string;
}>;

export type ScanOptions = Readonly<{
  chain: ScanChain;
  endpoint: string;
  rows: AddressRow[];
  gapLimit: number;
  signal?: AbortSignal;
  onProgress?: (completed: number, total: number, row: ScannedAddressRow) => void;
}>;

export function normalizeEndpoint(value: string): string {
  const endpoint = value.trim().replace(/\/+$/u, "");
  if (!endpoint) throw new Error("Укажите RPC/API endpoint.");
  const url = new URL(endpoint);
  if (url.protocol !== "https:" && !isLocalhost(url.hostname)) {
    throw new Error("Для внешнего endpoint требуется HTTPS.");
  }
  return endpoint;
}

export function validateGapLimit(value: number): number {
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw new Error("Gap limit должен быть целым числом от 1 до 100.");
  }
  return value;
}

export function shouldStopAfterGap(consecutiveUnused: number, gapLimit: number): boolean {
  return consecutiveUnused >= validateGapLimit(gapLimit);
}

export async function scanAddressRows(options: ScanOptions): Promise<ScannedAddressRow[]> {
  const endpoint = normalizeEndpoint(options.endpoint);
  const gapLimit = validateGapLimit(options.gapLimit);
  if (options.rows.length === 0) throw new Error("Сначала сформируйте диапазон адресов.");

  const results: ScannedAddressRow[] = [];
  let consecutiveUnused = 0;

  for (const row of options.rows) {
    if (options.signal?.aborted) throw abortError();
    let scanned: ScannedAddressRow;
    try {
      scanned = options.chain === "ethereum"
        ? await scanEthereum(endpoint, row, options.signal)
        : await scanBitcoin(endpoint, row, options.signal);
    } catch (error) {
      if (options.signal?.aborted) throw abortError();
      scanned = {
        ...row,
        balance: "—",
        transactionCount: 0,
        status: "error",
        error: error instanceof Error ? error.message : "Неизвестная ошибка сканирования",
      };
    }

    results.push(scanned);
    options.onProgress?.(results.length, options.rows.length, scanned);

    if (scanned.status === "unused") consecutiveUnused += 1;
    else if (scanned.status === "used") consecutiveUnused = 0;

    if (shouldStopAfterGap(consecutiveUnused, gapLimit)) break;
  }

  return results;
}

async function scanEthereum(endpoint: string, row: AddressRow, signal?: AbortSignal): Promise<ScannedAddressRow> {
  const [balanceHex, txCountHex] = await Promise.all([
    ethereumRpc(endpoint, "eth_getBalance", [row.address, "latest"], signal),
    ethereumRpc(endpoint, "eth_getTransactionCount", [row.address, "latest"], signal),
  ]);
  const wei = parseRpcHex(balanceHex);
  const transactionCount = Number(parseRpcHex(txCountHex));
  const used = wei > 0n || transactionCount > 0;
  return {
    ...row,
    balance: formatUnits(wei, 18, 8, "ETH"),
    transactionCount,
    status: used ? "used" : "unused",
  };
}

async function ethereumRpc(endpoint: string, method: string, params: unknown[], signal?: AbortSignal): Promise<string> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal,
  });
  if (!response.ok) throw new Error(`Ethereum RPC: HTTP ${response.status}`);
  const payload = await response.json() as { result?: string; error?: { message?: string } };
  if (payload.error) throw new Error(payload.error.message || "Ethereum RPC вернул ошибку.");
  if (typeof payload.result !== "string") throw new Error("Ethereum RPC вернул некорректный ответ.");
  return payload.result;
}

async function scanBitcoin(endpoint: string, row: AddressRow, signal?: AbortSignal): Promise<ScannedAddressRow> {
  const response = await fetch(`${endpoint}/address/${encodeURIComponent(row.address)}`, { signal });
  if (!response.ok) throw new Error(`Bitcoin API: HTTP ${response.status}`);
  const data = await response.json() as {
    chain_stats?: { funded_txo_sum?: number; spent_txo_sum?: number; tx_count?: number };
    mempool_stats?: { funded_txo_sum?: number; spent_txo_sum?: number; tx_count?: number };
  };
  const chain = data.chain_stats;
  const mempool = data.mempool_stats;
  if (!chain || !mempool) throw new Error("Bitcoin API вернул некорректный ответ.");
  const balance = BigInt((chain.funded_txo_sum ?? 0) - (chain.spent_txo_sum ?? 0) + (mempool.funded_txo_sum ?? 0) - (mempool.spent_txo_sum ?? 0));
  const transactionCount = (chain.tx_count ?? 0) + (mempool.tx_count ?? 0);
  return {
    ...row,
    balance: formatUnits(balance, 8, 8, "BTC"),
    transactionCount,
    status: balance > 0n || transactionCount > 0 ? "used" : "unused",
  };
}

export function parseRpcHex(value: string): bigint {
  if (!/^0x[0-9a-f]+$/iu.test(value)) throw new Error("Некорректное hex-значение RPC.");
  return BigInt(value);
}

export function formatUnits(value: bigint, decimals: number, precision: number, symbol: string): string {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const base = 10n ** BigInt(decimals);
  const whole = absolute / base;
  const fraction = (absolute % base).toString().padStart(decimals, "0").slice(0, precision).replace(/0+$/u, "");
  return `${negative ? "-" : ""}${whole}${fraction ? `.${fraction}` : ""} ${symbol}`;
}

function isLocalhost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function abortError(): Error {
  return new DOMException("Сканирование отменено.", "AbortError");
}
