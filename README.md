# HD Wallet Explorer

Локальный open-source инструмент для исследования HD-кошельков, BIP39 seed, derivation paths, Bitcoin/Ethereum адресов, watch-only discovery и публичного wallet workspace.

> Текущая версия: **v0.11.0**

## Назначение

HD Wallet Explorer работает с известной структурой кошелька:

- Seed Explorer;
- Derivation Explorer;
- Path Comparison;
- Bitcoin и Ethereum address generation;
- watch-only profiles и discovery;
- публичный Workspace.

Descriptors, multisig, PSBT и инспекция готовых публичных ключей относятся к отдельному проекту **Wallet Key Explorer**. Recovery, перебор неизвестных путей и wallet fingerprinting относятся к **Wallet Recovery Studio**.

## Возможности v0.11.0

### Seed Explorer

- BIP39 validation для 12/15/18/21/24 английских слов;
- optional BIP39 passphrase;
- entropy и checksum;
- wallet seed;
- master fingerprint;
- master xpub;
- masked master xprv в отдельно включаемом опасном режиме;
- ручная и автоматическая очистка sensitive session.

### Derivation Explorer

- произвольный BIP32 derivation path;
- нормализация hardened-маркеров `'`, `h` и `H`;
- presets BIP44, BIP49, BIP84, BIP86 и Ethereum;
- Bitcoin mainnet/testnet;
- разбор purpose, coin type, account, branch и address index;
- вывод normalized path, address, public key и derived xpub;
- только публичные результаты в интерфейсе.

### Path Comparison

- одновременное сравнение BIP44/BIP49/BIP84/BIP86 и Ethereum;
- выбор account, receive/change branch и index;
- Bitcoin mainnet/testnet;
- таблица path, script type, address, public key и derived xpub;
- CSV/JSON export только публичных результатов.

### Wallet Explorer

- Ethereum offline derivation по `m/44'/60'/0'/0/N`;
- Bitcoin BIP44/BIP49/BIP84/BIP86;
- генерация одного адреса или диапазона;
- scanner через Ethereum JSON-RPC и Bitcoin Esplora;
- gap limit, retries, delay, timeout, cancellation и progress;
- watch-only `xpub/ypub/zpub/tpub/upub/vpub`;
- External `/0` и Change `/1` discovery.

### Workspace

- watch-only profiles;
- discovery snapshots;
- публичная адресная книга;
- labels, notes и favorites;
- импорт/экспорт `wallet-project.json`;
- runtime sanitization: неизвестные и secret-like поля отбрасываются при импорте и экспорте.

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

Команда последовательно запускает TypeScript, ESLint, tests и production build.

## Интерфейс

В v0.11.0 все модули объединены в одну responsive desktop-first оболочку с постоянной боковой навигацией:

1. **Workspace** — публичные профили, история и заметки.
2. **Seed Explorer** — BIP39 и master keys.
3. **Derivation Explorer** — произвольные paths и presets.
4. **Path Comparison** — сравнение стандартов из одной seed.
5. **Wallet Explorer** — address generation, scanner и watch-only.

Sensitive-разделы отдельно помечены в интерфейсе. Workspace и watch-only относятся к публичной области данных.

## Основные сценарии

### Seed Explorer

1. Откройте **Seed Explorer**.
2. Введите mnemonic и optional passphrase.
3. Нажмите **Проверить seed**.
4. Проверьте entropy, checksum, fingerprint и master xpub.
5. Раскрывайте wallet seed или xprv только при необходимости.
6. После работы нажмите **Очистить чувствительные данные**.

Сессия автоматически очищается через пять минут бездействия.

### Derivation Explorer

1. Введите mnemonic и passphrase.
2. Выберите preset либо задайте произвольный path.
3. Для Bitcoin выберите mainnet/testnet.
4. Выполните деривацию.
5. Проверьте стандарт, сеть, address, public key, xpub и уровни пути.

Для нестандартного BIP32 path приложение не придумывает тип адреса, если его невозможно определить по структуре пути.

### Path Comparison

1. Введите одну mnemonic.
2. Выберите Bitcoin network, account, branch и index.
3. Запустите сравнение.
4. Сопоставьте BIP44, BIP49, BIP84, BIP86 и Ethereum.
5. При необходимости экспортируйте публичную таблицу в CSV или JSON.

Одна seed создаёт разные адреса, потому что каждый стандарт использует другой derivation path и/или script type.

### Watch-only

Для реальных средств предпочтителен watch-only режим. Account-level xpub позволяет исследовать только доступные non-hardened ветки. Соседние hardened accounts из него вывести нельзя.

## Безопасность

- Деривация выполняется локально.
- Mnemonic, passphrase, seed, private keys и WIF не отправляются в сеть.
- Sensitive tools не подключены к Workspace/localStorage.
- Workspace экспортирует только явно разрешённые публичные поля.
- Импортированный Workspace пересобирается через allowlist и отбрасывает неизвестные поля.
- Сетевой scanner выключен до явного согласия.
- Во внешние API отправляются только публичные адреса.
- HTTPS обязателен вне localhost; URL с credentials отклоняются.

> Проект не проходил независимый аудит безопасности. Для рабочих средств используйте изолированную офлайн-среду и проверяйте первые адреса в исходном кошельке.

## Документация

- `TODO.md` — roadmap и оставшиеся задачи.
- `CHANGELOG.md` — история изменений.
- `docs/PATH_COMPARISON.md` — устройство стандартов и сравнение paths.

## Следующие этапы

- copy controls с явными предупреждениями;
- полный официальный BIP32 vector suite;
- CSV/JSON export одиночного Derivation Explorer результата;
- descriptor import;
- Hardware Wallet Center;
- расширенный Blockchain Explorer и Portfolio.

## Лицензия

MIT License.
