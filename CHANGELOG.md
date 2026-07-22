# Changelog

## 0.11.0 — 2026-07-23

### Added

- Seed Explorer with BIP39 validation for 12/15/18/21/24 words.
- Entropy, mnemonic checksum, wallet seed, master fingerprint, master xpub and guarded master xprv.
- Ephemeral sensitive session with manual cleanup and five-minute automatic cleanup.
- Canonical BIP32 extended-key parser with Base58Check and SLIP-132 metadata.
- Canonical derivation-path parser with normalization of `'`, `h` and `H`.
- Derivation Explorer with arbitrary paths and BIP44/BIP49/BIP84/BIP86/Ethereum presets.
- Path Comparison for Bitcoin mainnet/testnet and Ethereum.
- Public CSV/JSON export for comparison results.
- Unified responsive Wallet Exploration Suite shell with permanent grouped navigation.
- Public/sensitive context badges and a visible security boundary.
- Workspace allowlist sanitization on import and export.
- Security tests proving mnemonic, passphrase, seed, xprv, WIF and private-key extras are not serialized.
- Path Comparison documentation.

### Changed

- Wallet Explorer, Seed Explorer, Derivation Explorer and Path Comparison now share one application shell.
- Workspace import no longer returns untrusted objects directly; it rebuilds a sanitized public model.
- Project scope migrated from the mistaken Wallet Key Explorer roadmap into HD Wallet Explorer.
- README and TODO were reorganized around the actual product boundaries and remaining hardening tasks.
- Application and package version updated to `0.11.0`.

### Security

- Sensitive tools remain detached from Workspace and localStorage.
- Workspace serialization uses explicit field allowlists rather than TypeScript types alone.
- Network scanning still requires explicit consent and sends only public addresses.

## 0.10.0 — 2026-07-22

- Fixed React 19 ESLint failures caused by synchronous state updates inside effects.
- Added top-level Workspace and Explorer navigation.
- Added portfolio-style public workspace dashboard cards.
- Added persistent discovery snapshots with balances and usage summaries.
- Added public address book with labels, notes, favorites, search and deletion.
- Added full public workspace export/import through `wallet-project.json`.
- Added responsive workspace styling and tests.

## 0.8.0 — 2026-07-22

- Added Watch-only Discovery Engine v1.
- Added automatic scanning of External and Change branches.
- Added address-gap stopping and per-branch maximum limits.
- Added discovery progress, cancellation, balances and transaction summaries.
- Added explicit documentation of hardened multi-account limitations.

## 0.7.0 — 2026-07-22

- Added Bitcoin watch-only mode without mnemonic or private keys.
- Added xpub, ypub, zpub, tpub, upub and vpub parsing with checksum validation.
- Added public derivation for external and change branches.
- Added local public profile storage, loading and deletion.
- Added CSV/JSON export for watch-only address ranges.

## 0.6.0 — 2026-07-22

- Finished the runnable scanner workflow in the browser UI.
- Added Bitcoin mainnet/testnet Esplora endpoint presets.
- Added request timeout, retry backoff and configurable request delay.
- Added explicit scan states, progress messages and result summary.
- Added stricter endpoint validation, including rejection of credentials in URLs.

## 0.5.0 — 2026-07-22

- Added opt-in public-address balance scanning.
- Added Ethereum JSON-RPC and Bitcoin Esplora-compatible adapters.
- Added gap-limit stopping, progress reporting and cancellation.
- Added scanner validation and formatting tests.

## 0.4.0 — 2026-07-22

- Added local generation of consecutive Ethereum and Bitcoin address ranges.
- Added public-only range results without displaying private keys or WIF.
- Added responsive address tables and CSV/JSON export.

## 0.3.0 — 2026-07-22

- Added Bitcoin mainnet/testnet derivation.
- Added BIP44, BIP49, BIP84 and BIP86 address generation.
- Added Bitcoin account/change/address index controls.

## 0.2.0

- Added local BIP39 and Ethereum derivation.
