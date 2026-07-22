# Security Policy

HD Wallet Explorer is security-sensitive software. Do not use unreleased builds with valuable seed phrases.

## Current version

Version 0.2.0 accepts an English BIP39 mnemonic and optional passphrase for local Ethereum derivation. No network requests are required or implemented by the wallet module.

## Security boundaries

- Secrets are held only in React state and local function scope.
- Secrets are not intentionally written to localStorage, sessionStorage, IndexedDB, cookies, URLs, logs or analytics.
- The mnemonic and passphrase are never passed to a network adapter.
- Derived private keys are hidden by default and copying is disabled until explicitly revealed.
- The reset action clears UI state and wipes mutable byte arrays owned by the derivation function.
- Browser JavaScript cannot guarantee that immutable strings or runtime copies have been physically erased from memory. Close the tab or browser after sensitive use.

## Non-negotiable rules

- Secrets must never be sent over the network.
- Secrets must never be stored in browser persistence.
- Cryptographic primitives must come from mature reviewed libraries.
- Every supported chain requires official or independently verified test vectors.
- Network scanning receives public addresses only and must be explicitly enabled.
- Production dependencies must be reviewed before release.
- Transaction signing is out of scope until a separate threat model is approved.

## Safe testing

Use the built-in public Hardhat demonstration mnemonic. Never paste a seed phrase received from another person, website, messenger or support agent.

## Reporting

Do not disclose vulnerabilities publicly before a fix is available. Open a private security advisory in the repository after it is created.
