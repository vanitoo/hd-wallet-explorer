"use client";

import { useMemo, useRef, useState } from "react";
import {
  deriveEthereumAccount,
  inspectEnglishMnemonic,
  type EthereumDerivationResult,
} from "../domain/ethereum";

const DEMO_MNEMONIC = "test test test test test test test test test test test junk";

type Props = Readonly<{
  path: string;
  pathIsValid: boolean;
}>;

export function OfflineWalletPanel({ path, pathIsValid }: Props) {
  const [mnemonic, setMnemonic] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [result, setResult] = useState<EthereumDerivationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const mnemonicRef = useRef<HTMLTextAreaElement>(null);

  const validation = useMemo(() => inspectEnglishMnemonic(mnemonic), [mnemonic]);

  function derive() {
    setError(null);
    setShowPrivateKey(false);
    try {
      setResult(deriveEthereumAccount({ mnemonic, passphrase, path }));
    } catch (cause) {
      setResult(null);
      setError(cause instanceof Error ? cause.message : "Не удалось выполнить деривацию.");
    }
  }

  function resetSecrets() {
    setMnemonic("");
    setPassphrase("");
    setResult(null);
    setError(null);
    setShowMnemonic(false);
    setShowPassphrase(false);
    setShowPrivateKey(false);
    mnemonicRef.current?.focus();
  }

  function loadDemo() {
    setMnemonic(DEMO_MNEMONIC);
    setPassphrase("");
    setResult(null);
    setError(null);
  }

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1200);
  }

  const canDerive = validation.valid && pathIsValid;

  return (
    <section className="wallet-panel" aria-labelledby="offline-title">
      <div className="section-heading split-heading">
        <div>
          <p className="eyebrow">Offline derivation</p>
          <h2 id="offline-title">Получить Ethereum-адрес из seed-фразы</h2>
          <p>Вычисление выполняется только в браузере. Сетевые запросы отсутствуют.</p>
        </div>
        <span className="offline-badge">● OFFLINE</span>
      </div>

      <div className="secret-warning">
        <strong>Не вводите рабочую seed-фразу на чужом или заражённом устройстве.</strong>
        <span>Для проверки интерфейса используйте встроенную демонстрационную фразу.</span>
      </div>

      <div className="field-group">
        <div className="label-row">
          <label htmlFor="mnemonic">BIP39 mnemonic · английский словарь</label>
          <button type="button" className="text-button" onClick={loadDemo}>Демо-фраза</button>
        </div>
        <div className="secret-input-shell">
          <textarea
            ref={mnemonicRef}
            id="mnemonic"
            value={mnemonic}
            onChange={(event) => {
              setMnemonic(event.target.value);
              setResult(null);
            }}
            rows={3}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="none"
            className={showMnemonic ? "" : "masked-secret"}
            placeholder="Введите 12, 15, 18, 21 или 24 слова"
          />
          <button type="button" onClick={() => setShowMnemonic((value) => !value)}>
            {showMnemonic ? "Скрыть" : "Показать"}
          </button>
        </div>
        {mnemonic ? (
          <p className={`field-status ${validation.valid ? "success" : "error"}`}>
            {validation.valid
              ? `Корректная BIP39-фраза · ${validation.wordCount} слов`
              : validation.message}
          </p>
        ) : (
          <p className="field-status">Фраза не сохраняется в localStorage или cookies.</p>
        )}
      </div>

      <div className="field-group compact-field">
        <label htmlFor="passphrase">BIP39 Passphrase · необязательно</label>
        <div className="single-secret-input">
          <input
            id="passphrase"
            type={showPassphrase ? "text" : "password"}
            value={passphrase}
            onChange={(event) => {
              setPassphrase(event.target.value);
              setResult(null);
            }}
            autoComplete="off"
            spellCheck={false}
            placeholder="Пусто = кошелёк без дополнительной passphrase"
          />
          <button type="button" onClick={() => setShowPassphrase((value) => !value)}>
            {showPassphrase ? "Скрыть" : "Показать"}
          </button>
        </div>
        <p className="field-status">Любая другая passphrase создаёт совершенно другой кошелёк.</p>
      </div>

      <div className="derivation-actions">
        <button type="button" className="primary-button" disabled={!canDerive} onClick={derive}>
          Получить адрес
        </button>
        <button type="button" className="secondary-button" onClick={resetSecrets}>
          Очистить секреты
        </button>
        <code>{pathIsValid ? path : "Исправьте derivation path"}</code>
      </div>

      {error ? <div className="inline-error" role="alert">{error}</div> : null}

      {result ? (
        <div className="wallet-result" aria-live="polite">
          <ResultRow
            label="Ethereum address"
            value={result.address}
            copied={copied === "address"}
            onCopy={() => copy("address", result.address)}
          />
          <ResultRow
            label="Public key"
            value={result.publicKey}
            copied={copied === "public"}
            onCopy={() => copy("public", result.publicKey)}
          />
          <div className="private-key-block">
            <div>
              <span>Private key</span>
              <strong>{showPrivateKey ? result.privateKey : "••••••••••••••••••••••••••••••••"}</strong>
            </div>
            <div className="result-actions">
              <button type="button" onClick={() => setShowPrivateKey((value) => !value)}>
                {showPrivateKey ? "Скрыть" : "Показать"}
              </button>
              <button
                type="button"
                disabled={!showPrivateKey}
                onClick={() => copy("private", result.privateKey)}
              >
                {copied === "private" ? "Скопировано" : "Копировать"}
              </button>
            </div>
          </div>
          <p className="private-warning">Приватный ключ даёт полный доступ к средствам. Не отправляйте его никому.</p>
        </div>
      ) : null}
    </section>
  );
}

function ResultRow({
  label,
  value,
  copied,
  onCopy,
}: Readonly<{ label: string; value: string; copied: boolean; onCopy: () => void }>) {
  return (
    <div className="result-row">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <button type="button" onClick={onCopy}>{copied ? "Скопировано" : "Копировать"}</button>
    </div>
  );
}
