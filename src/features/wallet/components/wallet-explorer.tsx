"use client";

import { useMemo, useRef, useState } from "react";
import { bitcoinPath, deriveBitcoin, type BitcoinNetwork, type BitcoinResult, type BitcoinType } from "../domain/bitcoin";
import { deriveEthereum, inspectMnemonic, type EthereumResult } from "../domain/ethereum";
import { buildIndexRange, rowsToCsv, rowsToJson, type AddressRow } from "../domain/range";
import { scanAddressRows, type ScannedAddressRow } from "../domain/scanner";
import { WatchOnlyPanel } from "./watch-only-panel";

const DEMO = "test test test test test test test test test test test junk";
type Chain = "ethereum" | "bitcoin";
type Mode = "single" | "range" | "watch";
type Result = { chain: "ethereum"; value: EthereumResult } | { chain: "bitcoin"; value: BitcoinResult };

export function WalletExplorer() {
  const [chain, setChain] = useState<Chain>("ethereum");
  const [mode, setMode] = useState<Mode>("single");
  const [mnemonic, setMnemonic] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [type, setType] = useState<BitcoinType>("native-segwit");
  const [network, setNetwork] = useState<BitcoinNetwork>("mainnet");
  const [account, setAccount] = useState(0);
  const [change, setChange] = useState<0 | 1>(0);
  const [index, setIndex] = useState(0);
  const [ethIndex, setEthIndex] = useState(0);
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeCount, setRangeCount] = useState(20);
  const [result, setResult] = useState<Result | null>(null);
  const [rows, setRows] = useState<AddressRow[]>([]);
  const [scannedRows, setScannedRows] = useState<ScannedAddressRow[]>([]);
  const [endpoint, setEndpoint] = useState("");
  const [networkEnabled, setNetworkEnabled] = useState(false);
  const [gapLimit, setGapLimit] = useState(20);
  const [retries, setRetries] = useState(2);
  const [timeoutSeconds, setTimeoutSeconds] = useState(15);
  const [requestDelay, setRequestDelay] = useState(150);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const validation = useMemo(() => inspectMnemonic(mnemonic), [mnemonic]);
  const activeIndex = chain === "ethereum" ? ethIndex : index;
  const path = chain === "ethereum" ? `m/44'/60'/0'/0/${activeIndex}` : bitcoinPath(type, network, account, change, activeIndex);
  const usedCount = scannedRows.filter((row) => row.status === "used").length;
  const errorCount = scannedRows.filter((row) => row.status === "error").length;

  function resetOutput() {
    abortRef.current?.abort();
    setResult(null);
    setRows([]);
    setScannedRows([]);
    setScanProgress(0);
    setScanning(false);
    setScanMessage("");
    setError(null);
    setShow(false);
  }

  function switchChain(next: Chain) {
    setChain(next);
    resetOutput();
    setNetworkEnabled(false);
    setEndpoint(next === "bitcoin" ? (network === "mainnet" ? "https://mempool.space/api" : "https://mempool.space/testnet/api") : "");
  }

  function switchMode(next: Mode) {
    setMode(next);
    resetOutput();
    if (next === "watch") setChain("bitcoin");
  }

  function derive() {
    try {
      resetOutput();
      setResult(chain === "ethereum"
        ? { chain, value: deriveEthereum({ mnemonic, passphrase, path }) }
        : { chain, value: deriveBitcoin({ mnemonic, passphrase, path, network, type }) });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ошибка деривации");
    }
  }

  function deriveRange() {
    try {
      resetOutput();
      const nextRows = buildIndexRange(rangeStart, rangeCount).map((currentIndex) => {
        const currentPath = chain === "ethereum" ? `m/44'/60'/0'/0/${currentIndex}` : bitcoinPath(type, network, account, change, currentIndex);
        const value = chain === "ethereum"
          ? deriveEthereum({ mnemonic, passphrase, path: currentPath })
          : deriveBitcoin({ mnemonic, passphrase, path: currentPath, network, type });
        return { index: currentIndex, path: currentPath, address: value.address, publicKey: value.publicKey };
      });
      setRows(nextRows);
      setScanMessage("Диапазон готов. Теперь укажите API и запустите сканирование.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ошибка генерации диапазона");
    }
  }

  async function scan() {
    if (!networkEnabled) {
      setError("Подтвердите отправку публичных адресов в выбранный API.");
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setScanning(true);
    setScannedRows([]);
    setScanProgress(0);
    setError(null);
    setScanMessage("Подключение к API…");
    try {
      const values = await scanAddressRows({
        chain,
        endpoint,
        rows,
        gapLimit,
        retries,
        timeoutMs: timeoutSeconds * 1000,
        requestDelayMs: requestDelay,
        signal: controller.signal,
        onProgress: (completed, total, row) => {
          setScanProgress(Math.round(completed / total * 100));
          setScannedRows((current) => [...current, row]);
          setScanMessage(`Проверяется индекс ${row.index}. Выполнено ${completed} из ${total}.`);
        },
      });
      setScannedRows(values);
      const found = values.filter((row) => row.status === "used").length;
      setScanMessage(`Сканирование завершено. Проверено ${values.length}, использованных адресов: ${found}.`);
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") setScanMessage("Сканирование остановлено пользователем.");
      else setError(cause instanceof Error ? cause.message : "Ошибка сканирования");
    } finally {
      setScanning(false);
      abortRef.current = null;
    }
  }

  function clear() {
    setMnemonic("");
    setPassphrase("");
    resetOutput();
  }

  function setBitcoinNetwork(next: BitcoinNetwork) {
    setNetwork(next);
    resetOutput();
    if (chain === "bitcoin") setEndpoint(next === "mainnet" ? "https://mempool.space/api" : "https://mempool.space/testnet/api");
  }

  function download(kind: "csv" | "json") {
    const exportRows = scannedRows.length ? scannedRows : rows;
    const body = kind === "csv" ? rowsToCsv(exportRows) : rowsToJson(exportRows);
    const blob = new Blob([body], { type: kind === "csv" ? "text/csv;charset=utf-8" : "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `hd-wallet-addresses-${chain}.${kind}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <>
    <section className="hero"><h1>HD Wallet Explorer</h1><p>Создавайте адреса локально, используйте безопасные watch-only профили и проверяйте балансы через выбранный RPC.</p></section>
    <section className="panel">
      {mode !== "watch" && <div className="tabs"><button className={chain === "ethereum" ? "active" : ""} onClick={() => switchChain("ethereum")}>Ethereum</button><button className={chain === "bitcoin" ? "active" : ""} onClick={() => switchChain("bitcoin")}>Bitcoin</button></div>}
      <div className="subtabs mode-tabs three"><button className={mode === "single" ? "active" : ""} onClick={() => switchMode("single")}>Один адрес</button><button className={mode === "range" ? "active" : ""} onClick={() => switchMode("range")}>Диапазон и сканер</button><button className={mode === "watch" ? "active" : ""} onClick={() => switchMode("watch")}>Watch-only</button></div>

      {mode === "watch" ? <WatchOnlyPanel /> : <>
        {chain === "bitcoin" && <><div className="subtabs"><button className={network === "mainnet" ? "active" : ""} onClick={() => setBitcoinNetwork("mainnet")}>Mainnet</button><button className={network === "testnet" ? "active" : ""} onClick={() => setBitcoinNetwork("testnet")}>Testnet</button></div><div className="types">{([["legacy", "Legacy · BIP44"], ["nested-segwit", "Nested · BIP49"], ["native-segwit", "Native · BIP84"], ["taproot", "Taproot · BIP86"]] as const).map(([id, title]) => <button key={id} className={type === id ? "active" : ""} onClick={() => { setType(id); resetOutput(); }}>{title}</button>)}</div></>}

        {mode === "single" ? (chain === "ethereum" ? <div className="grid3"><NumberField label="Address index" value={ethIndex} min={0} onChange={setEthIndex}/></div> : <div className="grid3"><NumberField label="Account" value={account} min={0} onChange={setAccount}/><label>Chain<select value={change} onChange={(event) => setChange(Number(event.target.value) as 0 | 1)}><option value={0}>External · 0</option><option value={1}>Change · 1</option></select></label><NumberField label="Address index" value={index} min={0} onChange={setIndex}/></div>) : <div className="grid3">{chain === "bitcoin" && <><NumberField label="Account" value={account} min={0} onChange={setAccount}/><label>Chain<select value={change} onChange={(event) => setChange(Number(event.target.value) as 0 | 1)}><option value={0}>External · 0</option><option value={1}>Change · 1</option></select></label></>}<NumberField label="Начальный индекс" value={rangeStart} min={0} onChange={setRangeStart}/><NumberField label="Количество адресов" value={rangeCount} min={1} max={100} onChange={setRangeCount}/></div>}

        <div className="path">{mode === "single" ? path : `${chain === "ethereum" ? "m/44'/60'/0'/0" : "выбранный Bitcoin-путь"}/{${rangeStart}…${rangeStart + rangeCount - 1}}`}</div>
        <div className="warning">Используйте демо-фразу для проверки. Реальную seed-фразу вводите только на доверенном устройстве. Для регулярного сканирования безопаснее применять Watch-only.</div>
        <label>BIP39 mnemonic<textarea value={mnemonic} onChange={(event) => { setMnemonic(event.target.value); resetOutput(); }} placeholder="12, 15, 18, 21 или 24 слова" /></label>
        <button className="secondary" onClick={() => setMnemonic(DEMO)}>Загрузить демо-фразу</button>
        {mnemonic && <p className={validation.valid ? "valid" : "error"}>{validation.valid ? `Корректная BIP39-фраза · ${validation.wordCount} слов` : validation.message}</p>}
        <label>BIP39 Passphrase<input type="password" value={passphrase} onChange={(event) => setPassphrase(event.target.value)} placeholder="Необязательно" /></label>
        <div className="actions"><button className="primary" disabled={!validation.valid} onClick={mode === "single" ? derive : deriveRange}>{mode === "single" ? "Получить адрес" : "1. Сформировать диапазон"}</button><button className="secondary" onClick={clear}>Очистить секреты</button></div>
        {error && <div className="error">{error}</div>}

        {result && <div className="result"><Row label="Address" value={result.value.address}/><Row label="Public key" value={result.value.publicKey}/>{result.chain === "bitcoin" && <Row label="WIF" value={show ? result.value.wif : "••••••••••••••••••••"}/>}<Row label="Private key" value={show ? result.value.privateKey : "••••••••••••••••••••"}/><button className="secondary" onClick={() => setShow((value) => !value)}>{show ? "Скрыть секреты" : "Показать приватный ключ и WIF"}</button></div>}

        {rows.length > 0 && <><div className="scanner"><div className="scanner-title"><div><strong>2. Сканирование публичных адресов</strong><span>{chain === "ethereum" ? "Нужен Ethereum JSON-RPC URL с поддержкой CORS" : "По умолчанию используется публичный Esplora API mempool.space"}</span></div><span className={`scanner-state ${scanning ? "running" : "ready"}`}>{scanning ? "Выполняется" : "Готов"}</span></div><div className="grid3"><label>RPC/API endpoint<input value={endpoint} onChange={(event) => setEndpoint(event.target.value)} placeholder={chain === "ethereum" ? "https://ваш-rpc.example" : "https://mempool.space/api"}/></label><NumberField label="Gap limit" value={gapLimit} min={1} max={100} onChange={setGapLimit}/><NumberField label="Повторные попытки" value={retries} min={0} max={5} onChange={setRetries}/><NumberField label="Таймаут, секунд" value={timeoutSeconds} min={1} max={120} onChange={setTimeoutSeconds}/><NumberField label="Пауза между адресами, мс" value={requestDelay} min={0} max={5000} onChange={setRequestDelay}/></div><label className="network-consent"><input type="checkbox" checked={networkEnabled} onChange={(event) => setNetworkEnabled(event.target.checked)}/> Я разрешаю отправку сформированных публичных адресов в этот API</label><div className="actions"><button className="primary" disabled={!networkEnabled || scanning || !endpoint.trim()} onClick={scan}>{scanning ? `Сканирование · ${scanProgress}%` : "Запустить сканер"}</button>{scanning && <button className="secondary" onClick={() => abortRef.current?.abort()}>Остановить</button>}</div><progress max={100} value={scanProgress}/>{scanMessage && <div className="scan-message">{scanMessage}</div>}{scannedRows.length > 0 && <div className="scan-stats"><span>Проверено <strong>{scannedRows.length}</strong></span><span>Использовано <strong>{usedCount}</strong></span><span>Ошибок <strong>{errorCount}</strong></span></div>}</div>

        <div className="range-result"><div className="range-summary"><div><strong>{rows.length} адресов</strong><span>Индексы {rows[0].index}–{rows.at(-1)?.index}{scannedRows.length ? ` · проверено ${scannedRows.length}` : ""}</span></div><div className="actions compact"><button className="secondary" onClick={() => download("csv")}>Скачать CSV</button><button className="secondary" onClick={() => download("json")}>Скачать JSON</button></div></div><div className="address-table"><table><thead><tr><th>Index</th><th>Path</th><th>Address</th>{scannedRows.length > 0 && <><th>Balance</th><th>Tx</th><th>Status</th></>}<th></th></tr></thead><tbody>{rows.map((row) => { const scanned = scannedRows.find((item) => item.path === row.path); return <tr key={row.path}><td>{row.index}</td><td><code>{row.path}</code></td><td><code>{row.address}</code></td>{scannedRows.length > 0 && <><td>{scanned?.balance ?? "…"}</td><td>{scanned?.transactionCount ?? "…"}</td><td><span className={`status ${scanned?.status ?? "pending"}`}>{scanned?.status === "used" ? "Использован" : scanned?.status === "unused" ? "Пустой" : scanned?.status === "error" ? "Ошибка" : "Ожидание"}</span>{scanned?.error && <small className="scan-error">{scanned.error}</small>}</td></>}<td><CopyButton value={row.address}/></td></tr>; })}</tbody></table></div></div></>}
      </>}
    </section>
  </>;
}

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max?: number; onChange: (value: number) => void }) {
  return <label>{label}<input type="number" value={Number.isFinite(value) ? value : ""} min={min} max={max} onChange={(event) => onChange(event.target.valueAsNumber)} /></label>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="row"><div><span>{label}</span><strong>{value}</strong></div><CopyButton value={value}/></div>;
}
function CopyButton({ value }: { value: string }) {
  async function copy() { await navigator.clipboard.writeText(value); }
  return <button onClick={copy}>Копировать</button>;
}
