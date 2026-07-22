"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { exploreSeed, maskSecret, type SeedExplorerResult } from "../domain/seed-explorer";

const DEMO_MNEMONIC = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const AUTO_CLEAR_MS = 5 * 60 * 1000;

export function SeedExplorerPanel() {
  const [mnemonic, setMnemonic] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [result, setResult] = useState<SeedExplorerResult | null>(null);
  const [error, setError] = useState("");
  const [showSeed, setShowSeed] = useState(false);
  const [showXprv, setShowXprv] = useState(false);

  const hasSensitiveData = Boolean(mnemonic || passphrase || result);
  const autoClearLabel = useMemo(() => `${AUTO_CLEAR_MS / 60000} минут`, []);
  const clearSensitiveData = useCallback((): void => {
    setMnemonic("");
    setPassphrase("");
    setResult(null);
    setError("");
    setShowSeed(false);
    setShowXprv(false);
  }, []);

  useEffect(() => {
    if (!hasSensitiveData) return;
    const timeout = window.setTimeout(clearSensitiveData, AUTO_CLEAR_MS);
    return () => window.clearTimeout(timeout);
  }, [clearSensitiveData, hasSensitiveData]);

  function inspect(): void {
    try {
      setError("");
      setResult(exploreSeed({ mnemonic, passphrase }));
      setShowSeed(false);
      setShowXprv(false);
    } catch (cause) {
      setResult(null);
      setError(cause instanceof Error ? cause.message : "Не удалось разобрать seed-фразу.");
    }
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">LOCAL · SENSITIVE · EPHEMERAL</span>
          <h2>Seed Explorer</h2>
          <p>Проверка BIP39 mnemonic, entropy, wallet seed и master keys. Данные существуют только в памяти вкладки.</p>
        </div>
      </div>

      <div className="notice warning">
        Не используйте рабочую seed-фразу на подключённом к интернету устройстве. Mnemonic, passphrase, seed и xprv не сохраняются в Workspace или localStorage и автоматически очищаются через {autoClearLabel} бездействия.
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
            placeholder="BIP39 passphrase"
          />
        </label>
      </div>

      <div className="actions">
        <button onClick={inspect}>Проверить seed</button>
        <button className="secondary" onClick={() => setMnemonic(DEMO_MNEMONIC)}>Демо-фраза</button>
        <button className="secondary" onClick={clearSensitiveData}>Очистить чувствительные данные</button>
      </div>

      {error ? <div className="notice error">{error}</div> : null}

      {result ? (
        <div className="result-grid">
          <Result label="Количество слов" value={String(result.wordCount)} />
          <Result label="Mnemonic checksum" value="Корректна" />
          <Result label="Entropy" value={result.entropyHex} mono />
          <Result label="Master fingerprint" value={result.masterFingerprint} mono />
          <Result label="Master xpub" value={result.masterXpub} mono />
          <Result label="Wallet seed" value={showSeed ? result.seedHex : maskSecret(result.seedHex)} mono action={<button className="small secondary" onClick={() => setShowSeed((value) => !value)}>{showSeed ? "Скрыть" : "Показать"}</button>} />
          <Result label="Master xprv — опасный режим" value={showXprv ? result.masterXprv : maskSecret(result.masterXprv)} mono action={<button className="small secondary" onClick={() => setShowXprv((value) => !value)}>{showXprv ? "Скрыть" : "Показать"}</button>} />
        </div>
      ) : null}
    </section>
  );
}

function Result(props: Readonly<{ label: string; value: string; mono?: boolean; action?: ReactNode }>) {
  return <div className="result-card"><div className="result-label"><span>{props.label}</span>{props.action}</div><div className={props.mono ? "mono break-all" : ""}>{props.value}</div></div>;
}
