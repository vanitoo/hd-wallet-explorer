# Path Comparison

Path Comparison derives the same account, branch and address index through five standard paths:

| Standard | Default path | Result |
|---|---|---|
| BIP44 | `m/44'/0'/0'/0/0` | Bitcoin P2PKH |
| BIP49 | `m/49'/0'/0'/0/0` | Bitcoin P2SH-P2WPKH |
| BIP84 | `m/84'/0'/0'/0/0` | Bitcoin P2WPKH |
| BIP86 | `m/86'/0'/0'/0/0` | Bitcoin P2TR |
| Ethereum BIP44 | `m/44'/60'/0'/0/0` | Ethereum account |

For Bitcoin testnet, coin type `1'` is used instead of `0'`.

## Why the addresses differ

A BIP39 mnemonic is converted into one deterministic wallet seed. BIP32 then treats that seed as the root of a large key tree. Every derivation path selects a different branch of that tree, so it produces a different child key.

Bitcoin standards also encode those child keys with different output policies:

- BIP44 uses legacy P2PKH;
- BIP49 uses nested SegWit;
- BIP84 uses native SegWit;
- BIP86 uses Taproot.

Ethereum uses coin type `60'` and its own address construction.

## Security model

Mnemonic and passphrase remain in the current React component state and are not included in comparison results. CSV and JSON exports contain only:

- preset and standard;
- network and script type;
- derivation path;
- public address;
- public key;
- derived extended public key.

Exports do not contain mnemonic, passphrase, seed, private key, xprv or WIF.

For real funds, run the application in an isolated offline environment and verify the first addresses against the original wallet or hardware device.

## Verification

After pulling the changes, run:

```bash
npm run check
```

The path-comparison tests cover mainnet, testnet, all five presets and secret-free CSV/JSON exports.
