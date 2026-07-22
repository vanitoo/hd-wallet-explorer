# Architecture

## Product boundary

HD Wallet Explorer is an explorer and discovery tool, not a transaction wallet. The initial product does not send or sign transactions and does not persist secrets.

## Layering

```text
UI components
    ↓
Feature application logic
    ↓
Pure domain modules
    ↓
Chain adapters / workers (future)
```

### `src/features/derivation/domain`

Pure TypeScript without React or browser APIs. It owns parsing, validation, formatting and preset construction. This layer is covered by unit tests and can later be reused by workers.

### `src/features/derivation/components`

Presentation and interaction only. It converts user input into calls to the domain layer and displays normalized paths and validation errors.

### Future `src/chains`

Each chain adapter will implement a narrow common contract for derivation and public-address formatting. Bitcoin and Ethereum must remain isolated because their address formats and derivation conventions differ.

### Future `src/workers`

Bulk derivation and account discovery will run in Web Workers to avoid blocking the UI.

## Secret-handling rules

- Never place mnemonic, passphrase, seed or private key in URLs.
- Never write secrets to localStorage, IndexedDB, logs or analytics.
- Network scanning is disabled while a secret is present.
- Secret views must be opt-in and cleared explicitly or by timeout.
- RPC adapters receive public addresses only.

## State model

Current UI state is ephemeral React state. Future persistent state may contain only public watch-only profiles and user preferences. Secret state remains in-memory and isolated from persistence.


## Ethereum offline derivation

`features/wallet/domain/ethereum.ts` is a pure domain module. It validates an English BIP39 mnemonic, derives a BIP32 child key, calculates an uncompressed secp256k1 public key and converts it to an EIP-55 Ethereum address.

The UI owns only ephemeral state. The domain layer has no React, storage or network dependencies. Future scanners must accept public addresses and must not import the secret-input module.

### Data flow

```text
Mnemonic + optional passphrase + path
        ↓
BIP39 validation and seed derivation
        ↓
BIP32 child private key
        ↓
secp256k1 uncompressed public key
        ↓
Keccak-256 and EIP-55 address
        ↓
Ephemeral UI result
```
