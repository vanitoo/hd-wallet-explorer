"use client";

import { useState } from "react";
import type { BitcoinNetwork } from "../domain/bitcoin";
import {
  compareStandardPaths,
  comparisonToCsv,
  comparisonToJson,
  type PathComparisonResult,
} from "../domain/path-comparison";

const DEMO_MNEMONIC = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

export function PathComparisonPanel() {
  const [mnemonic, setMnemonic] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [network, setNetwork] = useState<BitcoinNetwork>("mainnet");
  const [account, setAccount] = useState(0);
  const [change, setChange] = useState<0 | 1>(0);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<PathComparisonResult | null>(null);
  const [error, setError] = useState("");

  function compare(): void {
    try {
      setError("");
      setResult(compareStandardPaths({ mnemonic, passphrase, bitcoinNetwork: network, account, change, index }));
    } catch (cause) {
      setResult(null);
      setError(cause instanceof Error ? cause.message : "Не удалось сравнить derivation paths.");
    }
  }

  function clearSensitiveData(): void {
    setMnemonic("");
    setPassphrase("");
    setResult(null);
    setError("");
  }

  function download(format: "csv" | "json"): void {
    if (!result) return;
    const content = format === "csv" ? comparisonToCsv(result) : comparisonToJson(result);
    const blob = new Blob([content], { type: format === "csv" ? "text/csv;charset=utf-8" : "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `path-comparison.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">LOCAL · ONE SEED · FIVE STANDARDS</span>
          <h2>Path Comparison</h2>
          <p>Сравнение BIP44, BIP49, BIP84, BIP86 и Ethereum для одной mnemonic.</p>
        </div>
      </div>

      <div className="notice warning">
        Один seed создаёт разные адреса, потому что каждый derivation path выбирает другую ветку ключевого дерева, а Bitcoin-стандарты дополнительно используют разные script types.
      </div>

      <div className="form-grid">
        <label className="field field-wide">
          <span>BIP39 mnemonic</span>
          <textarea rows={4} value={mnemonic} onChange={(event) => setMnemonic(event.target.value)} autoComplete="off" spellCheck={false} />
        </label>
        <label className="field">
          <span>Optional passphrase</span>
          <input type="password" value={passphrase} onChange={(event) => setPassphrase(event.target.value)} autoComplete="new-password" />
        </label>
        <label className="field">
          <span>Bitcoin network</span>
          <select value={network} onChange={(event) => setNetwork(event.target.value as BitcoinNetwork)}>
            <option value="mainnet">Mainnet</option>
            <option value="testnet">Testnet</option>
          </select>
        </label>
        <label className="field"><span>Account</span><input type="number" min={0} value={account} onChange={(event) => setAccount(Number(event.target.value))} /></label>
        <label className="field">
          <span>Branch</span>
          <select value={change} onChange={(event) => setChange(Number(event.target.value) as 0 | 1)}>
            <option value={0}>Receive / external</option>
            <option value={1}>Change / internal</option>
          </select>
        </label>
        <label className="field"><span>Address index</span><input type="number" min={0} value={index} onChange={(event) => setIndex(Number(event.target.value))} /></label>
      </div>

      <div className="actions">
        <button onClick={compare}>Сравнить пути</button>
        <button className="secondary" onClick={() => setMnemonic(DEMO_MNEMONIC)}>Демо-фраза</button>
        <button className="secondary" onClick={clearSensitiveData}>Очистить чувствительные данные</button>
      </div>

      {error ? <div className="notice error">{error}</div> : null}

      {result ? (
        <>
          <div className="actions">
            <button className="secondary" onClick={() => download("csv")}>Экспорт CSV</button>
            <button className="secondary" onClick={() => download("json")}>Экспорт JSON</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Стандарт</th><th>Сеть / script</th><th>Path</th><th>Address</th><th>Public key</th></tr></thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.preset}>
                    <td><strong>{row.standard}</strong><br /><small>{row.preset}</small></td>
                    <td>{row.network}<br /><small>{row.scriptType}</small></td>
                    <td className="mono">{row.path}</td>
                    <td className="mono break-all">{row.address}</td>
                    <td className="mono break-all">{row.publicKey}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
