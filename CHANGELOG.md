# Changelog

## 0.10.0 — 2026-07-22

- Fixed React 19 ESLint failures caused by synchronous setState calls inside effects.
- Added a top-level Workspace and Explorer navigation shell.
- Added portfolio-style dashboard cards for public wallet data.
- Added persistent discovery snapshots with balances and usage summaries.
- Added a public address book with labels, notes, favorites, search and deletion.
- Added full public workspace export/import through `wallet-project.json`.
- Added responsive workspace styling and workspace domain tests.
- Updated footer version to v0.10.0.

## 0.8.0 — 2026-07-22

- Added Watch-only Discovery Engine v1.
- Added automatic scanning of External and Change branches.
- Added address-gap stopping and per-branch maximum limits.
- Added discovery progress, cancellation, balances and transaction summaries.
- Added explicit documentation of hardened multi-account limitations.
- Added version and MIT License text to the footer.
- Added discovery helper tests.

## 0.7.0 — 2026-07-22

- Added Bitcoin watch-only mode without mnemonic or private keys.
- Added xpub, ypub, zpub, tpub, upub and vpub parsing with checksum validation.
- Added public derivation for external and change branches.
- Added local public profile storage, loading and deletion.
- Added CSV/JSON export for watch-only address ranges.
- Added watch-only domain tests and security documentation.

## 0.6.0 — 2026-07-22

- Finished the runnable scanner workflow in the browser UI.
- Added Bitcoin mainnet/testnet Esplora endpoint presets.
- Added request timeout, retry backoff and configurable request delay.
- Added explicit scan states, progress messages and result summary.
- Added stricter endpoint validation, including rejection of credentials in URLs.
- Expanded scanner tests and usage documentation.

## 0.5.0 — 2026-07-22

- Added opt-in public-address balance scanning.
- Added Ethereum JSON-RPC and Bitcoin Esplora-compatible adapters.
- Added gap-limit stopping, progress reporting and cancellation.
- Added endpoint validation with HTTPS required outside localhost.
- Added scanner status, balances, transaction counts and error display.
- Added scanner validation and formatting tests.

## 0.4.0 — 2026-07-22

- Added local generation of consecutive Ethereum and Bitcoin address ranges.
- Added a hard limit of 100 addresses per operation.
- Added public-only range results without displaying private keys or WIF.
- Added responsive address table, copy controls and CSV/JSON export.
- Added range validation and export tests.

## 0.3.0 — 2026-07-22

- Added Bitcoin mainnet/testnet derivation.
- Added BIP44, BIP49, BIP84 and BIP86 address generation.
- Added Bitcoin account/change/address index controls.
- Added local WIF generation and BIP84/BIP86 tests.

## 0.2.0

- Added local BIP39 and Ethereum derivation.
