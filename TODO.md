# TODO — HD Wallet Explorer

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
- [x] Adopt Wallet Explorer scope from Wallet Key Explorer roadmap
- [x] Audit existing BIP39, BIP32, Bitcoin and Ethereum derivation modules
- [x] Add canonical extended-key parser for public and private BIP32 versions
- [x] Unify watch-only validation with the canonical extended-key parser
- [x] Define canonical derivation-path parser and formatter
- [x] Normalize derivation markers `'`, `h` and `H`
- [x] Add extended-key and derivation-path tests
- [x] Add Seed Explorer with ephemeral in-memory state
- [x] Add official BIP39 seed-vector coverage

## v1.0 — Wallet Exploration Suite

### Foundation

- [x] Audit existing BIP39, BIP32, Bitcoin and Ethereum derivation modules
- [x] Define canonical derivation-path model
- [x] Centralize Base58Check extended-key parsing and metadata validation
- [x] Reuse canonical path validation in Bitcoin derivation
- [x] Keep Seed Explorer secrets in ephemeral React state only
- [x] Keep mnemonic, passphrase, seed and xprv out of Workspace and localStorage flows
- [ ] Add explicit workspace-serialization security tests

### Seed Explorer

- [x] BIP39 mnemonic validation
- [x] Support 12/15/18/21/24 words
- [x] Optional BIP39 passphrase
- [x] Display entropy
- [x] Display mnemonic checksum status
- [x] Display wallet seed with masking
- [x] Display master fingerprint
- [x] Display master xpub
- [x] Dangerous opt-in display for xprv
- [ ] Copy controls with explicit warnings
- [x] Manual clear-sensitive-data action
- [x] Automatic sensitive-session timeout
- [x] Official BIP39 seed-vector tests
- [ ] Add complete official BIP32 vector suite

### Derivation Explorer

- [ ] Arbitrary derivation path input
- [x] Normalize `'`, `h` and `H`
- [x] Validate hardened and non-hardened segments
- [ ] Explain purpose, coin type, account, change and index
- [ ] BIP44 preset
- [ ] BIP49 preset
- [ ] BIP84 preset
- [ ] BIP86 preset
- [ ] Receive/change branches
- [ ] Derive public key and address
- [ ] Export only public results
- [x] Add derivation-path parser tests

### Path Comparison

- [ ] Compare BIP44/BIP49/BIP84/BIP86 from one seed
- [ ] Show path, standard, script type, address and public key
- [ ] Bitcoin mainnet/testnet comparison
- [ ] Ethereum standard-path comparison
- [ ] Explain why one seed creates different addresses
- [ ] CSV/JSON export
- [ ] Comparison vector tests

### Professional Explorer UI

- [ ] Permanent sidebar navigation
- [ ] Dashboard as default landing page
- [ ] Sections: Workspace, Seed, Derivation, Bitcoin, Ethereum, Settings, About
- [ ] Reusable stat cards and summary panels
- [ ] Recent discovery and workspace activity
- [ ] Public portfolio summary
- [ ] Better sorting, filtering and search
- [ ] Quick actions
- [ ] Responsive desktop-first layout
- [ ] Optimize large address ranges
- [ ] Complete v1.0 documentation

## v1.1 — Descriptor Integration

Descriptor creation and deep diagnostics stay in Wallet Key Explorer. HD Wallet Explorer imports descriptors for watch-only exploration.

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

- [ ] Encrypted optional public-profile backup
- [ ] Independent security audit
- [ ] Threat model documentation
- [ ] Dependency and supply-chain review
- [ ] Accessibility audit

## Project boundaries

### Wallet Key Explorer

Owns analysis of existing public cryptographic objects: extended public keys, descriptors, multisig, addresses and PSBT.

### Wallet Recovery Studio

Owns recovery, unknown derivation-path scanning, wallet fingerprinting and ranked search.
