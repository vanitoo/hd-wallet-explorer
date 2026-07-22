# HD Wallet Explorer

Локальный open-source инструмент для исследования HD-кошельков, BIP39 seed, derivation paths, генерации адресов, watch-only discovery и ведения публичного wallet workspace.

> Текущая версия: **v0.10.0**

## Назначение

HD Wallet Explorer отвечает за работу с известной структурой кошелька:

- Wallet Explorer;
- Seed Explorer;
- Derivation Explorer;
- BIP39 mnemonic и optional passphrase;
- получение wallet seed и master keys;
- генерацию Bitcoin и Ethereum адресов;
- сравнение BIP44/BIP49/BIP84/BIP86 derivation paths;
- watch-only profiles;
- discovery и публичный workspace.

Функции анализа отдельных публичных объектов — descriptors, multisig, PSBT и инспекция готовых публичных ключей — остаются в отдельном проекте **Wallet Key Explorer**.

Recovery, перебор неизвестных путей и идентификация неизвестного кошелька относятся к **Wallet Recovery Studio**.

## Текущие возможности

- Рабочий Seed Explorer с BIP39 validation для 12/15/18/21/24 слов.
- Optional BIP39 passphrase, entropy, wallet seed и master fingerprint.
- Master xpub и masked master xprv в отдельно включаемом опасном режиме.
- Автоматическая очистка чувствительной сессии через пять минут.
- Рабочий Derivation Explorer с произвольным BIP32 path.
- Presets BIP44, BIP49, BIP84, BIP86 и Ethereum.
- Разбор purpose, coin type, account, branch и address index.
- Вывод normalized path, сети, script type, address, public key и derived xpub.
- Ethereum offline-деривация по `m/44'/60'/0'/0/N`.
- Bitcoin mainnet/testnet: BIP44, BIP49, BIP84 и BIP86.
- Генерация одного адреса или диапазона.
- Сканирование публичных адресов через Ethereum JSON-RPC или Bitcoin Esplora.
- Watch-only без seed-фразы и приватных ключей.
- Импорт `xpub`, `ypub`, `zpub`, `tpub`, `upub`, `vpub`.
- Discovery веток External `/0` и Change `/1` с address gap.
- Wallet Workspace: сводка, история discovery, адресная книга, заметки и избранное.
- Экспорт и импорт публичного проекта через `wallet-project.json`.
- CSV/JSON экспорт адресов.

## Запуск

Требуется Node.js 22 или новее.

```bash
npm install
npm run dev
```

Откройте `http://localhost:3000`.

Полная проверка:

```bash
npm run check
```

Команда запускает TypeScript, ESLint, тесты и production build.

## Основные сценарии

### Workspace

Workspace хранит только публичные данные в `localStorage`:

- watch-only профили;
- discovery snapshots;
- публичные адреса;
- названия, заметки и избранное.

Seed, mnemonic passphrase, wallet seed и приватные ключи не должны попадать в Workspace или `wallet-project.json`.

### Seed Explorer

1. Откройте **Seed Explorer** в верхней навигации.
2. Введите BIP39 mnemonic из 12, 15, 18, 21 или 24 английских слов.
3. При необходимости укажите BIP39 passphrase.
4. Нажмите **Проверить seed**.
5. Проверьте entropy, checksum, master fingerprint и master xpub.
6. Wallet seed и master xprv по умолчанию замаскированы и раскрываются отдельными кнопками.
7. После работы нажмите **Очистить чувствительные данные**.

Mnemonic, passphrase и вычисленные секреты находятся только в состоянии текущей вкладки. Они не записываются в Workspace или localStorage. Сессия автоматически очищается через пять минут бездействия.

Для безопасной проверки интерфейса используйте встроенную демо-фразу. Рабочую seed-фразу следует исследовать только в изолированной офлайн-среде.

### Derivation Explorer

1. Откройте **Derivation Explorer**.
2. Введите BIP39 mnemonic и optional passphrase.
3. Выберите BIP44, BIP49, BIP84, BIP86 или Ethereum preset либо введите произвольный path.
4. Для Bitcoin preset выберите mainnet или testnet.
5. Нажмите **Выполнить деривацию**.
6. Проверьте нормализованный путь, стандарт, сеть, script type, address, public key и derived xpub.
7. В таблице ниже проверьте каждый уровень: purpose, coin type, account, branch и address index.

Поддерживаются hardened-маркеры `'`, `h` и `H`; они нормализуются к `'`. Для нестандартного BIP32 path приложение выводит публичный ключ и derived xpub, но не придумывает тип адреса, если его невозможно определить из структуры пути.

Derivation Explorer не показывает private key или WIF и не сохраняет результат в Workspace автоматически.

### Один адрес

1. Откройте Explorer.
2. Выберите Ethereum или Bitcoin.
3. Для Bitcoin укажите сеть и стандарт.
4. Укажите account, branch и index.
5. Введите BIP39 mnemonic и optional passphrase.
6. Получите адрес локально.

Для реальных средств предпочтителен Watch-only. Рабочую seed-фразу не рекомендуется вводить в обычный браузерный профиль.

### Диапазон и сканер

Можно локально сформировать диапазон адресов, а затем отдельно разрешить отправку только публичных адресов в Bitcoin Esplora или Ethereum JSON-RPC.

Сканер поддерживает gap limit, timeout, retries, delay, остановку, прогресс, баланс и число транзакций.

### Watch-only и Discovery

Watch-only принимает account-level `xpub/ypub/zpub/tpub/upub/vpub`, генерирует External и Change branches и сохраняет только публичный профиль.

Discovery автоматически проверяет ветки `/0` и `/1` до address gap или защитного лимита.

Из account-level xpub невозможно вывести соседние hardened accounts. Для multi-account discovery потребуются отдельные account xpub или descriptors.

# Roadmap

## v1.0 — Wallet Exploration Suite

Главный ближайший этап, перенесённый из ошибочного roadmap Wallet Key Explorer.

### Seed Explorer

Реализовано базовое ядро и интерфейс:

- проверка BIP39 mnemonic;
- 12/15/18/21/24 слов;
- optional passphrase;
- entropy и mnemonic checksum;
- wallet seed;
- master fingerprint;
- master xpub;
- xprv только в отдельно включаемом опасном режиме;
- маскирование секретов;
- ручная и автоматическая очистка sensitive session;
- полный запрет сохранения секретов в Workspace.

Осталось добавить copy controls с явными предупреждениями, security tests сериализации Workspace и полный набор BIP32 vectors.

### Derivation Explorer

Реализовано:

- произвольный derivation path;
- нормализация `'`, `h` и `H`;
- разбор purpose, coin type, account, change и index;
- hardened/non-hardened segments;
- BIP44/BIP49/BIP84/BIP86 presets;
- Bitcoin mainnet/testnet и Ethereum presets;
- receive/change branches через path;
- вывод public key, derived xpub и address;
- публичный-only UI;
- тесты стандартных и custom paths.

Осталось добавить CSV/JSON export публичного результата.

### Path Comparison

- один seed в BIP44/BIP49/BIP84/BIP86;
- сравнение path, script type, address и public key;
- Bitcoin mainnet/testnet;
- Ethereum standard paths;
- объяснение, почему один seed создаёт разные адреса;
- табличный экспорт результатов.

### Professional Explorer UI

- постоянная боковая навигация;
- Dashboard;
- разделы Workspace, Seed, Derivation, Bitcoin, Ethereum, Settings и About;
- улучшенные таблицы, фильтры и быстрые действия;
- responsive desktop-first UX;
- оптимизация больших диапазонов;
- полная документация v1.0.

## v1.1 — Descriptor Integration

HD Wallet Explorer будет импортировать готовые публичные descriptors для watch-only и multi-account профилей. Создание и глубокая диагностика descriptor остаются в Wallet Key Explorer.

- descriptor import;
- checksum validation;
- `wpkh`, `sh(wpkh)`, `tr`, `sortedmulti` watch-only profiles;
- multi-account public profile sets;
- BIP86 watch-only policy.

## v1.2 — Hardware Wallet Center

- Ledger, Trezor, Coldcard, Jade и Keystone;
- read-only получение fingerprint, xpub и descriptors;
- проверка первых адресов;
- информация об устройстве без доступа к приватным ключам.

## v1.3 — Blockchain Explorer

- нормализованная история транзакций;
- UTXO viewer;
- inputs, outputs и fees;
- explorer links;
- script analysis;
- фильтрация и экспорт.

## v1.4 — Portfolio

- Bitcoin и Ethereum summary;
- группировка по profiles и labels;
- historical balances;
- EVM token balances;
- reports и export.

## v1.5 — Plugin SDK

- block explorer providers;
- RPC providers;
- export formats;
- report generators;
- дополнительные сети и диагностические модули.

## Безопасность

- Деривация выполняется локально.
- Сетевой режим выключен до явного согласия.
- Во внешние API отправляются только публичные адреса.
- Mnemonic, passphrase, seed, private keys и WIF не отправляются в сеть.
- Seed Explorer не подключён к Workspace/localStorage и автоматически очищает чувствительную сессию.
- Derivation Explorer показывает только публичные результаты и не сохраняет их автоматически.
- HTTPS обязателен вне localhost.
- URL с credentials отклоняются.
- Sensitive session не должна сохраняться в `localStorage`, URL, логах или workspace export.

> Проект не проходил независимый аудит безопасности. Для реальных средств используйте изолированную среду и проверяйте первые адреса в исходном кошельке.

## Лицензия

MIT License.
