"use client";

import { useMemo, useState } from "react";
import { OfflineWalletPanel } from "@/features/wallet/components/offline-wallet-panel";
import {
  describeDerivationPath,
  formatDerivationPath,
  parseDerivationPath,
} from "../domain/derivation-path";
import {
  createEthereumPath,
  DERIVATION_PRESETS,
  type DerivationMode,
} from "../domain/presets";

const DEFAULT_PATH = "m/44'/60'/0'/0/0";

export function PathWorkbench() {
  const [path, setPath] = useState(DEFAULT_PATH);
  const [mode, setMode] = useState<DerivationMode>("wallet-address");
  const [index, setIndex] = useState(1000);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    try {
      const parsed = parseDerivationPath(path);
      return {
        ok: true as const,
        normalized: formatDerivationPath(parsed),
        details: describeDerivationPath(parsed),
        segmentCount: parsed.segments.length,
      };
    } catch (error) {
      return {
        ok: false as const,
        message: error instanceof Error ? error.message : "Некорректный путь.",
      };
    }
  }, [path]);

  function applyIndex() {
    if (!Number.isInteger(index) || index < 0 || index > 0x7fffffff) return;
    setPath(createEthereumPath(mode, index));
  }

  async function copyPath() {
    if (!result.ok) return;
    await navigator.clipboard.writeText(result.normalized);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <section className="workspace" aria-labelledby="workspace-title">
      <div className="workspace-header">
        <div>
          <p className="eyebrow">Derivation Path Engine</p>
          <h1 id="workspace-title">Откройте любой узел HD-дерева</h1>
          <p>
            Перейдите сразу к индексу 1000, укажите собственный путь и локально получите Ethereum-адрес
            из BIP39 seed-фразы. Никакие секреты не отправляются в сеть.
          </p>
        </div>
        <span className="version-pill">v0.2.0</span>
      </div>

      <div className="workspace-grid">
        <div className="panel editor-panel">
          <div className="field-group">
            <label htmlFor="derivation-path">Путь деривации</label>
            <div className={`path-input-shell ${result.ok ? "is-valid" : "is-invalid"}`}>
              <span aria-hidden="true">⌘</span>
              <input
                id="derivation-path"
                value={path}
                onChange={(event) => setPath(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={!result.ok}
              />
            </div>
            {result.ok ? (
              <p className="field-status success">Корректный путь · {result.segmentCount} уровней</p>
            ) : (
              <p className="field-status error" role="alert">{result.message}</p>
            )}
          </div>

          <div className="quick-builder">
            <div className="section-heading">
              <div>
                <h2>Быстрый переход Ethereum</h2>
                <p>Две распространённые, но разные схемы индексации.</p>
              </div>
            </div>

            <div className="mode-switch" role="radiogroup" aria-label="Схема индексации">
              <button
                type="button"
                className={mode === "wallet-address" ? "active" : ""}
                onClick={() => setMode("wallet-address")}
                aria-pressed={mode === "wallet-address"}
              >
                Address index
                <small>m/44&apos;/60&apos;/0&apos;/0/N</small>
              </button>
              <button
                type="button"
                className={mode === "bip44-account" ? "active" : ""}
                onClick={() => setMode("bip44-account")}
                aria-pressed={mode === "bip44-account"}
              >
                BIP44 account
                <small>m/44&apos;/60&apos;/N&apos;/0/0</small>
              </button>
            </div>

            <div className="index-row">
              <label htmlFor="account-index">Индекс</label>
              <input
                id="account-index"
                type="number"
                min={0}
                max={0x7fffffff}
                value={index}
                onChange={(event) => setIndex(event.target.valueAsNumber)}
              />
              <button type="button" className="primary-button" onClick={applyIndex}>
                Построить путь
              </button>
            </div>
          </div>

          <div className="presets">
            <h2>Пресеты</h2>
            <div className="preset-list">
              {DERIVATION_PRESETS.map((preset) => (
                <button key={preset.id} type="button" onClick={() => setPath(preset.path)}>
                  <span>{preset.title}</span>
                  <small>{preset.description}</small>
                  <code>{preset.path}</code>
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="panel result-panel" aria-label="Разбор пути">
          <div className="result-topline">
            <div>
              <p className="eyebrow">Normalized path</p>
              <h2>{result.ok ? result.normalized : "Путь не готов"}</h2>
            </div>
            <button type="button" className="icon-button" onClick={copyPath} disabled={!result.ok}>
              {copied ? "Скопировано" : "Копировать"}
            </button>
          </div>

          {result.ok ? (
            <ol className="path-tree">
              <li><span className="tree-node root">m</span><strong>Master key</strong></li>
              {result.details.map((detail, position) => (
                <li key={`${detail}-${position}`}>
                  <span className="tree-line" aria-hidden="true" />
                  <span className="tree-node">{result.normalized.split("/")[position + 1]}</span>
                  <strong>{detail}</strong>
                </li>
              ))}
            </ol>
          ) : (
            <div className="empty-state">Исправьте путь слева, и здесь появится его структура.</div>
          )}

          <div className="security-card">
            <span aria-hidden="true">◈</span>
            <div>
              <strong>Локальная криптография</strong>
              <p>Seed используется только в памяти вкладки. Сканирование сети по-прежнему отключено.</p>
            </div>
          </div>
        </aside>
      </div>

      <OfflineWalletPanel
        path={result.ok ? result.normalized : path}
        pathIsValid={result.ok && result.normalized.startsWith("m/44\'/60\'/")}
      />
    </section>
  );
}
