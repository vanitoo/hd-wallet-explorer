# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-07-22

### Added

- Local English BIP39 mnemonic validation
- Optional BIP39 passphrase support
- Ethereum BIP32/secp256k1 derivation for arbitrary compatible paths
- EIP-55 checksum address generation
- Public-key and protected private-key result views
- Built-in public Hardhat demonstration mnemonic
- One-click secret and result reset
- Known Ethereum and EIP-55 unit tests

### Security

- No persistence or network use for secrets
- Private keys remain hidden and non-copyable until explicitly revealed
- Mutable seed and HD key data are wiped after derivation where the libraries permit it
- Documentation now explains browser memory-erasure limitations

## [0.1.0] - 2026-07-22

### Added

- Initial repository foundation
- Derivation path parser, formatter and validator
- Ethereum address-index and BIP44 account-index builders
- Bitcoin and Ethereum path presets
- Responsive local-first interface
- Unit tests, CI, architecture and security documentation
