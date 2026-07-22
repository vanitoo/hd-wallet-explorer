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
  retries?: number;
  timeoutMs?: number;
  requestDelayMs?: number;
  signal?: AbortSignal;
  onProgress?: (completed: number, total: number, row: ScannedAddressRow) => void;
}>;

export function normalizeEndpoint(value: string): string {
  const endpoint = value.trim().replace(/\/+$/u, "");
  if (!endpoint) throw new Error("Укажите RPC/API endpoint.");
  let url: URL;
  try { url = new URL(endpoint); } catch { throw new Error("Некорректный RPC/API URL."); }
  if (url.protocol !== "https:" && !isLocalhost(url.hostname)) throw new Error("Для внешнего endpoint требуется HTTPS.");
  if (url.username || url.password) throw new Error("Не помещайте логин и пароль прямо в URL.");
  return endpoint;
}

export function validateGapLimit(value: number): number {
  if (!Number.isInteger(value) || value < 1 || value > 100) throw new Error("Gap limit должен быть целым числом от 1 до 100.");
  return value;
}

export function validateRetries(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > 5) throw new Error("Количество повторов должно быть от 0 до 5.");
  return value;
}

export function validateTimeout(value: number): number {
  if (!Number.isInteger(value) || value < 1000 || value > 120000) throw new Error("Таймаут должен быть от 1 до 120 секунд.");
  return value;
}

export function shouldStopAfterGap(consecutiveUnused: number, gapLimit: number): boolean {
  return consecutiveUnused >= validateGapLimit(gapLimit);
}

export async function scanAddressRows(options: ScanOptions): Promise<ScannedAddressRow[]> {
  const endpoint = normalizeEndpoint(options.endpoint);
  const gapLimit = validateGapLimit(options.gapLimit);
  const retries = validateRetries(options.retries ?? 2);
  const timeoutMs = validateTimeout(options.timeoutMs ?? 15000);
  const requestDelayMs = Math.max(0, Math.min(5000, Math.trunc(options.requestDelayMs ?? 150)));
  if (options.rows.length === 0) throw new Error("Сначала сформируйте диапазон адресов.");

  const results: ScannedAddressRow[] = [];
  let consecutiveUnused = 0;

  for (const row of options.rows) {
    throwIfAborted(options.signal);
    let scanned: ScannedAddressRow;
    try {
      scanned = await withRetry(
        () => options.chain === "ethereum"
          ? scanEthereum(endpoint, row, timeoutMs, options.signal)
          : scanBitcoin(endpoint, row, timeoutMs, options.signal),
        retries,
        options.signal,
      );
    } catch (error) {
      throwIfAborted(options.signal);
      scanned = { ...row, balance: "—", transactionCount: 0, status: "error", error: error instanceof Error ? error.message : "Неизвестная ошибка сканирования" };
    }

    results.push(scanned);
    options.onProgress?.(results.length, options.rows.length, scanned);
    if (scanned.status === "unused") consecutiveUnused += 1;
    else if (scanned.status === "used") consecutiveUnused = 0;
    if (shouldStopAfterGap(consecutiveUnused, gapLimit)) break;
    if (requestDelayMs > 0) await delay(requestDelayMs, options.signal);
  }
  return results;
}

async function scanEthereum(endpoint: string, row: AddressRow, timeoutMs: number, signal?: AbortSignal): Promise<ScannedAddressRow> {
  const [balanceHex, txCountHex] = await Promise.all([
    ethereumRpc(endpoint, "eth_getBalance", [row.address, "latest"], timeoutMs, signal),
    ethereumRpc(endpoint, "eth_getTransactionCount", [row.address, "latest"], timeoutMs, signal),
  ]);
  const wei = parseRpcHex(balanceHex);
  const transactionCount = Number(parseRpcHex(txCountHex));
  return { ...row, balance: formatUnits(wei, 18, 8, "ETH"), transactionCount, status: wei > 0n || transactionCount > 0 ? "used" : "unused" };
}

async function ethereumRpc(endpoint: string, method: string, params: unknown[], timeoutMs: number, signal?: AbortSignal): Promise<string> {
  const response = await fetchWithTimeout(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: crypto.randomUUID(), method, params }),
  }, timeoutMs, signal);
  if (!response.ok) throw new Error(`Ethereum RPC: HTTP ${response.status}`);
  const payload = await response.json() as { result?: string; error?: { message?: string } };
  if (payload.error) throw new Error(payload.error.message || "Ethereum RPC вернул ошибку.");
  if (typeof payload.result !== "string") throw new Error("Ethereum RPC вернул некорректный ответ.");
  return payload.result;
}

async function scanBitcoin(endpoint: string, row: AddressRow, timeoutMs: number, signal?: AbortSignal): Promise<ScannedAddressRow> {
  const response = await fetchWithTimeout(`${endpoint}/address/${encodeURIComponent(row.address)}`, {}, timeoutMs, signal);
  if (!response.ok) throw new Error(`Bitcoin API: HTTP ${response.status}`);
  const data = await response.json() as { chain_stats?: { funded_txo_sum?: number; spent_txo_sum?: number; tx_count?: number }; mempool_stats?: { funded_txo_sum?: number; spent_txo_sum?: number; tx_count?: number } };
  const chain = data.chain_stats;
  const mempool = data.mempool_stats;
  if (!chain || !mempool) throw new Error("Bitcoin API вернул некорректный ответ.");
  const balance = BigInt((chain.funded_txo_sum ?? 0) - (chain.spent_txo_sum ?? 0) + (mempool.funded_txo_sum ?? 0) - (mempool.spent_txo_sum ?? 0));
  const transactionCount = (chain.tx_count ?? 0) + (mempool.tx_count ?? 0);
  return { ...row, balance: formatUnits(balance, 8, 8, "BTC"), transactionCount, status: balance > 0n || transactionCount > 0 ? "used" : "unused" };
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number, signal?: AbortSignal): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException("Превышен таймаут запроса.", "TimeoutError")), timeoutMs);
  const abort = () => controller.abort(signal?.reason);
  signal?.addEventListener("abort", abort, { once: true });
  try { return await fetch(url, { ...init, signal: controller.signal }); }
  finally { clearTimeout(timer); signal?.removeEventListener("abort", abort); }
}

async function withRetry<T>(operation: () => Promise<T>, retries: number, signal?: AbortSignal): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    throwIfAborted(signal);
    try { return await operation(); }
    catch (error) {
      throwIfAborted(signal);
      lastError = error;
      if (attempt < retries) await delay(400 * 2 ** attempt, signal);
    }
  }
  throw lastError;
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

function isLocalhost(hostname: string): boolean { return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1"; }
function throwIfAborted(signal?: AbortSignal): void { if (signal?.aborted) throw new DOMException("Сканирование отменено.", "AbortError"); }
function delay(ms: number, signal?: AbortSignal): Promise<void> { return new Promise((resolve, reject) => { const timer = setTimeout(resolve, ms); const abort = () => { clearTimeout(timer); reject(new DOMException("Сканирование отменено.", "AbortError")); }; signal?.addEventListener("abort", abort, { once: true }); }); }
