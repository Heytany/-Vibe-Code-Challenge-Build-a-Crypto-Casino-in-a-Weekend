# Итерация 3

## Монстр-герой на главной — держит обе игры в лапах

> **Статус:** реализовано Claude (Cloud), ожидает ревью PO и коммита.
> 1 итерация = 1 коммит.

---

## Что происходило

### PO

- Первая итерация с **Claude как основным разработчиком** (Cursor был архитектором ит.1–2).
- Главная страница: **полноэкранное анимированное пиксельное изображение монстра**.
- Игр — две, значит монстр **держит по панели в каждой лапе**.
- При загрузке пользователь видит в экране: **хедер + блок с играми + монстр с анимацией**.
- **Проследить за всеми разрешениями** (мобайл → десктоп).

### Архитектор → оператор (Claude)

- Принял правила `ai/` (HANDOFF, ONBOARDING, CONTEXT, specs motion/brutalism, workflow).
- Композиция: монстр сверху по центру, две руки спускаются к панелям внизу.
  Руки приходят в **25% / 75%** ширины — ровно по центрам сетки `1fr 1fr`, поэтому
  лапы «хватают» панели на любой ширине.
- **Анимация — только CSS** (плоский brutalist-слой `bw-mon-*`): дыхание, моргание
  глаза, покачивание рук/лап, мерцание антенн, glitch-срез. GSAP **не трогаем** —
  он остаётся за переходами маршрута / кошельком / выигрышем (ADR-011, ui-motion).
- Монстр на токенах `--bw-*` → автоматически инвертируется в день/ночь.
- Влезание в экран: `clamp()` + `min-height: calc(100vh - 15rem)` с центровкой.
- Карточки игр остались настоящими `<button>` с `matrix`-переходом и `UiLocaleText`
  (локаль-stagger и e2e-смоук-тесты не сломаны).

### Реализовано

```mermaid
flowchart TB
    subgraph Hero[Лобби — в экране при загрузке]
      Header[Хедер: тема/язык/кошелёк]
      Title[H1 Brutal wibe + tagline]
      Monster["🟩 Пиксель-монстр (CSS-анимация)"]
      Monster -->|левая лапа| Dice[Glitch Roll]
      Monster -->|правая лапа| Slot[Corrupted Reels]
    end
    Dice -->|matrix GSAP| RouteDice[/games/dice]
    Slot -->|matrix GSAP| RouteSlot[/games/slot]
```

| Файл | Изменение |
|------|-----------|
| `components/lobby/MonsterHero.vue` | **новый** — SVG-монстр + 8 дёргающихся щупалец + 2 слота-лапы |
| `pages/index.vue` | переписан вокруг монстра, центровка, fluid-карточки |
| `assets/css/brutalism.css` | layout стейджа + 7 keyframes `bw-mon-*` + reduced-motion |
| `i18n/{en,ru,uk}.json` | `lobby.tagline` + блок `seo.*` + `games.common/dice/slot` ключи |
| `ai/decisions/013-lobby-monster-hero.md` | **новый** ADR |

---

## SEO (морда монстра как иконка)

- `public/favicon.svg` — пиксельная **морда монстра** (свой «icon library»: рисованный SVG на токенах бренда), + `favicon-32.png`, `apple-touch-icon.png` (180), `og-image.png` (1200×630, монстр + бренд).
- `nuxt.config.ts` — title/description, **Open Graph + Twitter card**, `theme-color`, `lang`, иконки.
- Per-page описания через `useSeoMeta` на `index`/`games/dice`/`games/slot` (i18n `seo.*`).

## Подготовка к играм (следующая итерация)

> README требует **verifiable on-chain** — «параноик с эксплорером проверяет, что это не скам». Заложил ядро под это:

| Файл | Что |
|------|-----|
| `shared/rng-verify.ts` | **новый** — TS-зеркало on-chain RNG (FNV-1a), `computeRoll/Symbol/Reels`, `verifyDice/Slot`, выплаты, `base58Decode`. Байт-в-байт с `programs/wibe-casino/src/lib.rs`. |
| `tests/rng-verify.test.ts` | **новый** — фикс-векторы + инварианты (roll 1..100, symbol 0..5, домены, base58). |
| `composables/useBrutalMotion.ts` | `playWinBurst` / `playDepositPulse` — реализованы (были заглушки). |
| `ai/specs/games-implementation.md` | **новый** — точный чек-лист подключения программы → IDL → композаблы → UI → проверка ролла. |
| `i18n` `games.*` | ставка/депозит/вывод/проверка/результат на EN/RU/UK. |

Anchor-программа (`play_dice`, `play_slot`, deposit/withdraw, FNV-1a RNG, события) уже написана архитектором — остаётся **деплой + проводка фронта**.

---

## Проверки

| Что | Результат |
|-----|-----------|
| Композиция 320px (tiny) | ✅ монстр держит обе панели, влезает |
| Мобайл 375px | ✅ |
| Ноутбук 1366×768 | ✅ хедер+монстр+панели+футер в одном экране |
| Десктоп день/ночь | ✅ токены инвертируются, контраст ок |
| Карточки = `<button>`, matrix-переход | ✅ сохранено |
| `prefers-reduced-motion` | ✅ все `bw-mon-*` отключаются |
| Щупальца (8 шт) в пределах панели | ✅ нет гориз. скролла (320/375/1366) |
| RNG-зеркало | ✅ проверено node-скриптом: диапазоны, детерминизм, домены, base58 round-trip |
| OG-картинка / favicon | ✅ отрендерены, морда монстра читается на 32px |

> Скриншоты/иконки сняты Playwright (идентичный продакшен-SVG/CSS).
> **`pnpm build` / `pnpm test:e2e` / `pnpm test:motion` + `tests/rng-verify.test.ts` — гонять у PO на хосте:**
> в Linux-песочнице падают нативные модули (`oxc-parser`, `rollup`) — node_modules собран под macOS-arm64. Это ограничение среды, не код.

**Handoff:** Claude не смог задеплоить программу и подписать Phantom в sandbox (~75% лимита сессии). PO вернулся в Cursor; **it.4** — обязательный fun mode ([`04-fun-mode.md`](./04-fun-mode.md)); live Dice — [`04-plan-dice-game.md`](./04-plan-dice-game.md).

---

## Ресурсы

| | |
|---|---|
| **Оператор** | Claude (Cloud / Cowork, Team) — ит.3, первый проход |
| **Старт** | 30.05.2026 |
| **Время PO** | ~1 час |
| **Расход** | за 1 итерацию с Claude съели **~75% лимита сессии** (Cowork не даёт точный токен-каунт — см. Settings → Usage) |

---

**Коммит (ожидается):** `feat: iteration 3 — lobby pixel-art monster holding game panels`
