# HD Wallet Explorer

Local-first open-source tool for exploring HD wallet derivation paths and deriving Ethereum accounts without sending seed phrases or private keys to a server.

> Current version: **0.2.0** — Ethereum offline derivation.

## Current capabilities

- Validate English BIP39 mnemonics and checksums
- Use an optional, case-sensitive BIP39 passphrase
- Derive Ethereum keys with BIP32 and secp256k1
- Generate EIP-55 checksum addresses
- Parse and validate arbitrary BIP32-style derivation paths
- Jump directly to an Ethereum address index or BIP44 account index
- Reveal private keys only after a separate explicit action
- Clear mnemonic, passphrase and derived values in one click
- Fully static build with no analytics, cookies or backend

## Security warning

This is pre-release security-sensitive software. Do not use a valuable seed phrase until the project has received independent review. Prefer the built-in demonstration mnemonic while testing the interface.

The app never intentionally stores secrets in `localStorage`, cookies, URLs or a backend. JavaScript cannot guarantee perfect memory erasure because browser runtimes may copy strings internally; closing the tab or browser remains the strongest reset.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run check
```

This runs TypeScript, ESLint, unit tests and the production build.

## Cryptographic dependencies

The project uses focused libraries rather than a large wallet SDK:

- `@scure/bip39` — BIP39 validation and mnemonic-to-seed conversion
- `@scure/bip32` — hierarchical deterministic key derivation
- `@noble/curves` — secp256k1 public-key calculation
- `@noble/hashes` — Keccak-256 for Ethereum addresses

## Current limits

- English BIP39 wordlist only
- Ethereum derivation only
- No account balance or history scanning
- No transaction creation, signing or broadcasting
- No persistent watch-only profiles yet

## Documentation

- [Security policy](SECURITY.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](TODO.md)
- [Changelog](CHANGELOG.md)

## License

MIT
