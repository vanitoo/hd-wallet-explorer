# HD Wallet Explorer

Полностью локальный open-source обозреватель HD-кошельков.

## v0.5.0

- Ethereum: произвольный address index по пути `m/44'/60'/0'/0/N`.
- Bitcoin mainnet/testnet: Legacy BIP44, Nested SegWit BIP49, Native SegWit BIP84 и Taproot BIP86.
- Одиночная деривация с защищённым отображением приватного ключа и WIF.
- Локальная генерация диапазона до 100 публичных адресов.
- Проверка баланса и истории через пользовательский endpoint.
- Ethereum JSON-RPC и Bitcoin Esplora-compatible API.
- Gap limit, прогресс и отмена сканирования.
- Таблица результатов и экспорт CSV/JSON.

## Безопасность сетевого режима

Сетевой режим выключен по умолчанию и требует явного согласия. В RPC/API отправляются только публичные адреса. Mnemonic, BIP39 passphrase, seed, приватные ключи и WIF не передаются в сеть.

Для внешних endpoint разрешён только HTTPS. HTTP допускается только для localhost, чтобы можно было использовать собственный локальный узел.

## Запуск

```bash
npm install
npm run check
npm run dev
```

Открыть `http://localhost:3000`.

> Проект находится в ранней версии. Не используйте seed с реальными средствами до независимого аудита.
