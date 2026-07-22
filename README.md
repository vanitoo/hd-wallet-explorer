# HD Wallet Explorer

Полностью локальный open-source обозреватель HD-кошельков.

## v0.8.0

- Ethereum и Bitcoin offline-деривация.
- Bitcoin BIP44, BIP49, BIP84 и BIP86.
- Диапазоны адресов и сетевой сканер баланса.
- Watch-only без seed-фразы и приватных ключей.
- Импорт `xpub`, `ypub`, `zpub`, `tpub`, `upub`, `vpub`.
- Discovery Engine v1 для External и Change веток.
- Address gap, автоматическая остановка и сводка баланса.
- Публичные профили в localStorage и экспорт CSV/JSON.

## Watch-only Discovery

Откройте вкладку **Watch-only**, вставьте account-level публичный ключ и настройте:

- `Address gap` — сколько пустых адресов подряд завершает проверку ветки;
- `Максимум адресов на ветку` — защитный верхний предел;
- Esplora API — по умолчанию `mempool.space` для выбранной сети.

Discovery последовательно проверяет ветки `External / 0` и `Change / 1`, показывает использованные адреса, баланс, число транзакций и ошибки.

Account-level xpub не позволяет получить соседние аккаунты `account 1`, `account 2` и далее: уровень account в BIP44 hardened. Для полноценного multi-account discovery нужен отдельный публичный ключ каждого аккаунта или дескриптор кошелька.

Taproot watch-only пока не включён: обычный `xpub` не содержит однозначной информации о политике BIP86.

## Запуск

```bash
npm install
npm run dev
```

Откройте `http://localhost:3000`.

Полная проверка:

```bash
npm run check
```

## Безопасность

Сетевой режим выключен по умолчанию. В API отправляются только публичные адреса. Mnemonic, passphrase, seed, приватные ключи и WIF не передаются в сеть.

Для внешних endpoint разрешён только HTTPS. HTTP допускается только для localhost. URL с логином и паролем отклоняются.

> Проект находится в ранней версии. Не используйте seed с реальными средствами до независимого аудита.
