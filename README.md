# HD Wallet Explorer

Полностью локальный open-source обозреватель HD-кошельков.

## v0.3.0

- Ethereum: произвольный address index по пути `m/44'/60'/0'/0/N`.
- Bitcoin mainnet/testnet.
- Bitcoin Legacy BIP44, Nested SegWit BIP49, Native SegWit BIP84 и Taproot BIP86.
- Account, external/change и address index.
- WIF и приватный ключ скрыты по умолчанию.
- Без сервера, регистрации, cookies и аналитики.

## Запуск

```bash
npm install
npm run check
npm run dev
```

Открыть `http://localhost:3000`.

> Проект находится в ранней версии. Не используйте seed с реальными средствами до независимого аудита.
