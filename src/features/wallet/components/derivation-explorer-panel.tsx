"use client";

import { useState } from "react";
import {
  derivationPresetPath,
  exploreDerivation,
  type DerivationExplorerResult,
  type DerivationPreset,
} from "../domain/derivation-explorer";
import type { BitcoinNetwork } from "../domain/bitcoin";

const DEMO_MNEMONIC = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

export function DerivationExplorerPanel() {
  const [mnemonic, setMnemonic] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [path, setPath] = useState("m/84'/0'/0'/0/0");
  const [network, setNetwork] = useState<BitcoinNetwork>("mainnet");
  const [result, setResult] = useState<DerivationExplorerResult | null>(null);
  const [error, setError] = useState("");

  function applyPreset(preset: DerivationPreset): void {
    setPath(derivationPresetPath(preset, { network }));
    setResult(null);
    setError("");
  }

  function derive(): void {
    try {
      setError("");
      setResult(exploreDerivation({ mnemonic, passphrase, path }));
    } catch (cause) {
      setResult(null);
      setError(cause instanceof Error ? cause.message : "Не удалось выполнить деривацию.");
    }
  }

  function clearSensitiveData(): void {
    setMnemonic("");
    setPassphrase("");
    setResult(null);
    setError("");
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">LOCAL · BIP32 · PUBLIC RESULT</span>
          <h2>Derivation Explorer</h2>
          <p>Произвольный derivation path, presets BIP44/BIP49/BIP84/BIP86 и разбор каждого уровня пути.</p>
        </div>
      </div>

      <div className="notice warning">
        Mnemonic и passphrase используются только в памяти вкладки. Результат не сохраняется в Workspace автоматически.
      </div>

      <div className="form-grid">
        <label className="field field-wide">
          <span>BIP39 mnemonic</span>
          <textarea
            rows={4}
            value={mnemonic}
            onChange={(event) => setMnemonic(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder="12, 15, 18, 21 или 24 английских слова"
          />
        </label>
        <label className="field">
          <span>Optional passphrase</span>
          <input
            type="password"
            value={passphrase}
            onChange={(event) => setPassphrase(event.target.value)}
            autoComplete="new-password"
          />
        </label>
        <label className="field">
          <span>Bitcoin network для presets</span>
          <select value={network} onChange={(event) => setNetwork(event.target.value as BitcoinNetwork)}>
            <option value="mainnet">Mainnet</option>
            <option value="testnet">Testnet</option>
          </select>
        </label>
        <label className="field field-wide">
          <span>Derivation path</span>
          <input
            className="mono"
            value={path}
            onChange={(event) => setPath(event.target.value)}
            spellCheck={false}
            placeholder="m/84'/0'/0'/0/0"
          />
        </label>
      </div>

      <div className="actions">
        <button className="secondary" onClick={() => applyPreset("bip44")}>BIP44</button>
        <button className="secondary" onClick={() => applyPreset("bip49")}>BIP49</button>
        <button className="secondary" onClick={() => applyPreset("bip84")}>BIP84</button>
        <button className="secondary" onClick={() => applyPreset("bip86")}>BIP86</button>
        <button className="secondary" onClick={() => applyPreset("ethereum")}>Ethereum</button>
      </div>

      <div className="actions">
        <button onClick={derive}>Выполнить деривацию</button>
        <button className="secondary" onClick={() => setMnemonic(DEMO_MNEMONIC)}>Демо-фраза</button>
        <button className="secondary" onClick={clearSensitiveData}>Очистить чувствительные данные</button>
      </div>

      {error ? <div className="notice error">{error}</div> : null}

      {result ? (
        <>
          <div className="result-grid">
            <Result label="Нормализованный путь" value={result.normalizedPath} mono />
            <Result label="Стандарт" value={result.standard} />
            <Result label="Сеть" value={result.network} />
            <Result label="Script type" value={result.scriptType} />
            {result.address ? <Result label="Address" value={result.address} mono /> : null}
            <Result label="Public key" value={result.publicKey} mono />
            <Result label="Derived xpub" value={result.extendedPublicKey} mono />
          </div>

          <div className="table-wrap">
            <table>
              <thead><tr><th>Уровень</th><th>Назначение</th><th>Значение</th><th>Тип</th></tr></thead>
              <tbody>
                {result.levels.map((level) => (
                  <tr key={`${level.position}-${level.value}`}>
                    <td>{level.position + 1}</td>
                    <td>{level.label}</td>
                    <td className="mono">{level.value}</td>
                    <td>{level.hardened ? "Hardened" : "Public derivation"}</td>
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

function Result(props: Readonly<{ label: string; value: string; mono?: boolean }>) {
  return (
    <div className="result-card">
      <div className="result-label"><span>{props.label}</span></div>
      <div className={props.mono ? "mono break-all" : ""}>{props.value}</div>
    </div>
  );
}
