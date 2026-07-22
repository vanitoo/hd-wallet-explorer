# TODO — HD Wallet Explorer

## Completed

- [x] Canonical BIP32 extended-key parser
- [x] Canonical derivation-path parser and formatter
- [x] BIP39 mnemonic validation for 12/15/18/21/24 words
- [x] Seed Explorer with entropy, seed, fingerprint, xpub and guarded xprv
- [x] Ephemeral sensitive-session model
- [x] Manual and automatic sensitive-data cleanup
- [x] Derivation Explorer with arbitrary paths
- [x] BIP44/BIP49/BIP84/BIP86 and Ethereum presets
- [x] Bitcoin mainnet/testnet path classification
- [x] Path-level explanations
- [x] Path Comparison for Bitcoin standards and Ethereum
- [x] CSV/JSON public comparison export
- [x] Bitcoin and Ethereum address generation
- [x] Public address ranges
- [x] Public-address scanner
- [x] Watch-only xpub/ypub/zpub/tpub/upub/vpub profiles
- [x] External/change discovery
- [x] Public Workspace, notes and discovery history
- [x] Workspace JSON import/export
- [x] Runtime allowlist sanitization for Workspace serialization
- [x] Security tests preventing secret-like extra fields in Workspace
- [x] Unified responsive navigation shell
- [x] Project boundary migration from Wallet Key Explorer
- [x] README, changelog and Path Comparison documentation

## v0.12 — Hardening

### Seed Explorer

- [ ] Copy controls with explicit warnings
- [ ] Optional clipboard auto-clear
- [ ] Complete official BIP32 vector suite
- [ ] Visibility timer for revealed seed and xprv
- [ ] Clear sensitive session on tab visibility loss option

### Derivation Explorer

- [ ] CSV/JSON export for a single public derivation result
- [ ] More explicit validation for chain-specific path depth
- [ ] Preset controls for account, branch and index directly in the panel
- [ ] Public-only copy controls

### Security

- [ ] Threat model documentation
- [ ] Dependency and supply-chain review
- [ ] Content Security Policy review
- [ ] Independent security audit
- [ ] Accessibility audit

## v1.1 — Descriptor Integration

Descriptor creation and deep diagnostics remain in Wallet Key Explorer. HD Wallet Explorer imports ready public descriptors.

- [ ] Descriptor import
- [ ] Descriptor checksum validation
- [ ] `wpkh()` watch-only profile
- [ ] `sh(wpkh())` watch-only profile
- [ ] `tr()` watch-only profile
- [ ] `sortedmulti()` watch-only profile
- [ ] Multi-account public profile sets
- [ ] Taproot BIP86 watch-only policy

## v1.2 — Hardware Wallet Center

- [ ] Ledger read-only integration
- [ ] Trezor read-only integration
- [ ] Coldcard read-only import
- [ ] Jade read-only integration
- [ ] Keystone descriptor import
- [ ] Master fingerprint detection
- [ ] Public key and descriptor extraction
- [ ] Device information screen

## v1.3 — Blockchain Explorer

- [ ] Normalized transaction history
- [ ] Transaction fees and explorer links
- [ ] UTXO viewer
- [ ] Input/output inspection
- [ ] Script type inspection
- [ ] Address statistics
- [ ] History filtering and export
- [ ] Pause/resume persisted discovery sessions

## v1.4 — Portfolio

- [ ] Bitcoin portfolio summary
- [ ] Ethereum portfolio summary
- [ ] Address grouping by profile and label
- [ ] Historical balances
- [ ] EVM token balances
- [ ] Portfolio reports and export

## v1.5 — Plugin SDK

- [ ] Block explorer provider interface
- [ ] RPC provider interface
- [ ] Export format extensions
- [ ] Report generator extensions
- [ ] Additional network plugins

## Project boundaries

### Wallet Key Explorer

Owns analysis and construction of existing public cryptographic objects: extended public keys, descriptors, multisig, addresses and PSBT.

### Wallet Recovery Studio

Owns recovery, unknown derivation-path scanning, wallet fingerprinting and ranked search.
