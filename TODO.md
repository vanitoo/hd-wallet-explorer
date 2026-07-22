# TODO

## Completed

- [x] Derivation path engine
- [x] Ethereum offline derivation
- [x] Bitcoin BIP44/BIP49/BIP84/BIP86
- [x] Local address range generation
- [x] CSV/JSON export
- [x] Public-address balance scanner
- [x] Gap-limit stopping
- [x] Request cancellation, retries and configurable delays
- [x] Watch-only xpub/ypub/zpub/tpub/upub/vpub profiles
- [x] Public profile persistence in localStorage
- [x] Watch-only scanner integration
- [x] External/change discovery for current account
- [x] Workspace dashboard and discovery history
- [x] Public address notes, favorites and search
- [x] Public workspace JSON import/export

## v1.0 — Professional Explorer

- [ ] Replace top-level tab navigation with permanent sidebar navigation
- [ ] Add Dashboard as the default landing page
- [ ] Split application into Workspace, Bitcoin, Ethereum, Settings and About sections
- [ ] Add reusable stat cards and summary panels
- [ ] Add recent discovery and recent workspace activity blocks
- [ ] Add portfolio summary based on public workspace data
- [ ] Improve tables with sorting, filtering and search
- [ ] Add quick actions for common workflows
- [ ] Improve responsive desktop-first layout
- [ ] Optimize rendering for large address ranges
- [ ] Complete v1.0 user documentation

## v1.1 — Descriptor Explorer

- [ ] Descriptor parser and checksum validation
- [ ] Support `wpkh()`
- [ ] Support `sh(wpkh())`
- [ ] Support `tr()`
- [ ] Support `combo()`
- [ ] Support `sortedmulti()`
- [ ] Descriptor import/export
- [ ] Descriptor structure visualization
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

- [ ] Full normalized transaction history
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

## Security and maintenance

- [ ] Encrypted optional profile backup
- [ ] Independent security audit
- [ ] Threat model documentation
- [ ] Dependency and supply-chain review
- [ ] Accessibility audit

## Out of scope

Wallet recovery, unknown derivation-path scanning and wallet fingerprinting belong to the separate **Wallet Recovery Studio** project.