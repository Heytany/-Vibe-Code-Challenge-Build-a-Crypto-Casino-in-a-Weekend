# Помощь тестировщику — Brutal wibe

> Человекопонятная инструкция для PO / QA. Техническая документация агентов — в [`ai/`](../ai/).

---

## Что это

**Brutal wibe** — тестовое on-chain казино на **Solana devnet**. Реальных денег нет. Кошелёк нужен для LIVE; deposit / on-chain play работают при **реальных** `NUXT_PUBLIC_*` (program + mint задеплоены — см. it.12).

**FUN mode** (Dice / Slot) работает **без кошелька** и **без** переменных `NUXT_PUBLIC_*`.

> Placeholder id из `.env.example` (`Wibe1111…`, `Token1111…`) **не включают LIVE** — только FUN.

---

## 1. Запуск локально

```bash
pnpm install
cp .env.example .env   # опционально — для LIVE позже
pnpm dev
```

Откроется http://localhost:3000

### Env и красный экран

| Ситуация | Поведение |
|----------|-----------|
| `.env` **пустой** или нет файла | FUN работает; LIVE скрыт; в консоли предупреждение |
| **Все 4** `NUXT_PUBLIC_*` заполнены корректно | FUN + LIVE (после deploy программы) |
| Заполнена **часть** переменных | Fatal «environment misconfigured» — исправьте или очистите все |

Переменные (для LIVE, после deploy):

- `NUXT_PUBLIC_SOLANA_NETWORK=devnet`
- `NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com`
- `NUXT_PUBLIC_CASINO_PROGRAM_ID=…`
- `NUXT_PUBLIC_CASINO_TOKEN_MINT=…`

---

## 2. Netlify / preview (FUN-only)

Сайт можно деплоить **без** chain-env — главная и игры в FUN mode загрузятся.

1. Подключить репозиторий к Netlify (см. [`netlify.toml`](../netlify.toml)).
2. Build: `pnpm build`, publish: `.output/public`.
3. Env на Netlify **не обязателен** для демо FUN.
4. Phantom на production URL работает только по **HTTPS**.

---

## 3. Тестовый кошелёк Phantom (Phase A — connect)

### Шаг A — установить Phantom

**Десктоп:** Chrome / Brave / Firefox → расширение https://phantom.app/

**Мобилка:** приложение Phantom (iOS / Android). Открыть сайт в **встроенном браузере Phantom** (Menu → Browser) или Safari/Chrome с расширением (если доступно).

1. **Create a new wallet** — отдельный **тестовый** кошелёк, не mainnet с реальными деньгами.
2. Запишите seed phrase офлайн.

> Phantom = «логин». Email/пароля в Brutal wibe нет — connect = «зарегистрировался».

### Шаг B — Devnet

1. Phantom → **Settings** (шестерёнка).
2. **Developer Settings** → **Testnet Mode**  
   *или* сеть **Solana Devnet**.

### Шаг C — devnet-SOL (gas)

1. Copy address в Phantom.
2. https://faucet.solana.com/ → **Devnet** → airdrop.
3. ~30 сек — баланс SOL в Phantom.

Нужно для будущих транзакций (deposit/play). Для проверки **Connect** достаточно.

### Шаг D — Connect на сайте

1. **Connect Phantom** / **Подключить Phantom**.
2. Анимация трещины → Approve в Phantom.
3. Кнопка показывает адрес `Ab12…xy89`.
4. **Disconnect** — обычный клик, без анимации.

### Шаг E — что работает / не работает

| Действие | Статус |
|----------|--------|
| FUN Dice / Slot без кошелька | ✅ |
| Connect / Disconnect Phantom | ✅ |
| Переключение LIVE без wallet / без deploy | ⚠️ segmented radio + alert — highlight не переключается |
| Deposit / withdraw / on-chain play | ✅ при реальных env + Phantom devnet (it.12) |

Program: `BfdTrxqFfFhe4xA3XniqVWzVkQKX88za5yuA4FRq3ktw` · Mint: `He66seATY4XobvcwC8WZceMH3uncAqEx44T8HtLyttox`

### Phantom: «Unknown Token» и 10 000 WIBE

| Что видишь | Что это |
|------------|---------|
| **10 000** токенов в кошельке | Demo mint при `pnpm devnet:setup` — **не** выплата за выигрыш |
| **Unknown Token** + длинный mint | Нет Metaplex metadata — это **WIBE** (devnet). Имя в UI: `pnpm devnet:token-meta` |
| Выигрыш в LIVE | Меняется **баланс казино**, не кошелёк. В Phantom — только после **Withdraw** |

Runbook: [`scripts/devnet-deploy.md`](../scripts/devnet-deploy.md) · Netlify env: [`ai/specs/deploy.md`](../ai/specs/deploy.md)

### Funds bar (it.15) — где балансы и deposit

| Страница | FUN | LIVE |
|----------|-----|------|
| `/games/dice`, `/games/slot` | Fun balance + **Refill** (блок под шапкой) | Casino WIBE + Phantom WIBE + Deposit/Withdraw |
| Lobby `/` | Блок **скрыт** | Блок deposit (если Phantom + env) |

В панели игры (Play tab) — **только поле ставки**. Балансы не дублируются.

### «Списалось из Phantom, а в UI —»

| Симптом | Что делать |
|---------|------------|
| Casino / Phantom показывают **—** | Нажми **↻** в LIVE-блоке или переподключи Phantom. Должно быть **0** или число, не прочерк. |
| После Deposit toast ошибки, но WIBE ушли | Транзакция могла пройти — нажми ↻; проверь tx в [Solana Explorer](https://explorer.solana.com/?cluster=devnet). |
| Deposit disabled | Введи сумму ≥ 1 в поле (пустое поле = кнопка серая). |
| Roll/Spin LIVE без deposit | Сначала Deposit — создаётся on-chain **UserBalance** PDA. |

---

## 4. Мобилка — чеклист

Проверять **320px и 390px** (DevTools) + по возможности iPhone Safari.

| Область | Действие |
|---------|----------|
| Шапка | 2 строки: лого+тема+язык / wallet на всю ширину |
| Тосты | Win, auto-roll итог, offline — **внутри экрана**, не обрезаны справа |
| Dice / Slot | 3 таба (Play / Rules / Fair), куб/барабаны, кнопка Roll/Spin |
| Auto-bar | Rounds, ∞, speed, fullscreen — без горизонтального scroll |
| Crack modal | Connect — modal по центру, кнопки ≥44px |
| Access denied | `/games/nope` — заголовок переносится, matrix не ломает layout |
| Язык / тема | EN / RU / UK, ☀ / ☾ |

**iOS Safari:** hero не должен «прыгать» при скрытии адресной строки (100dvh + viewport anchor).

---

## 5. Что проверять на каждой итерации

| Область | Действие |
|---------|----------|
| Лобби → игра | Matrix-переход, Dice / Slot |
| **Dice (FUN)** | Roll, 3D-куб, matrix на win, тост выигрыша |
| **Slot (FUN)** | Spin, 3 барабана, matrix на win |
| Назад | «← Lobby» |
| Provably Fair | Tab Fair → recompute после игры |
| Auto-roll | Старт/стоп, тост итога |
| Reduced motion | OS «Reduce motion» — без оверлеев, логика работает |

---

## 6. Частые проблемы

| Симптом | Решение |
|---------|---------|
| Phantom не открывается | Расширение установлено? Pop-up не заблокирован? На мобилке — браузер Phantom |
| «Rejected» / LINK FAILED | Cancel в Phantom или не devnet |
| Красный экран env | Частично заполнен `.env` — заполните все 4 или очистите |
| LIVE не включается | Нужны wallet + **реальные** program id и mint (не `Wibe1111…` / `Token1111…`) |
| Тост обрезан | Обновите до it.11+; проверьте 320px |
| Нет анимаций | Reduce motion — норма |
| Баланс казино 0 | Контракт не задеплоен — [`ai/CONTEXT.md`](../ai/CONTEXT.md) |

---

## 7. Куда писать баги

1. Скрин + URL + браузер / устройство  
2. Шаги воспроизведения  
3. F12 → Console — красные строки  

Отчёты итераций: [`iterations/`](./). Агент читает последний файл перед работой.

**Дальше:** deploy Anchor — [`scripts/devnet-deploy.md`](../scripts/devnet-deploy.md), wire уже в коде (`useCasinoProgram`).
