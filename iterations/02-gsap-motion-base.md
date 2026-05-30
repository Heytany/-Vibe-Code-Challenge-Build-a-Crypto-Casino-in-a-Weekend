# Итерация 2

## GSAP motion foundation — matrix, crack wallet, theme, locale slugs

> **Статус:** в работе, ещё не закоммичено. 1 итерация = 1 коммит.

---

## Что происходило

### PO

- Сохранить простой brutalist UI, но **разрешить и требовать** сложные анимации в ключевых точках.
- Подключить **GreenSock (GSAP)** до передачи Claude.
- **Matrix glitch** при переходе lobby → игра.
- **Crack popup** для кошелька — ломаные трещины, 3D на ПК.
- **День/ночь** — полноэкранная анимация с иконками (Lucide).
- **Язык** — glitch на slug-кнопках + stagger на всём `.bw-locale-text` (`UiLocaleText`).
- Deploy из Git + [`help.md`](./help.md) для тестера Phantom.
- **Handoff:** после ит.2 PO переходит в **Claude (Cloud)** — исчерпан стандартный лимит Cursor ($20).

### Архитектор

- `gsap` + Pinia `motion` store, единый `useBrutalMotion()`.
- Hero: `MatrixTransitionOverlay`, `ScreenCrackOverlay`, `BrutalCrackModal`.
- Settings: `SettingsFlashOverlay` — theme; locale — glitch кнопки + stagger `.bw-locale-text`.
- Icons: **`lucide-vue-next`** (Sun / Moon).
- Theme: `stores/theme.ts`, ADR-012, day/night CSS tokens.
- Deploy: `vercel.json`, `netlify.toml`, CI, `ai/specs/deploy.md`.

### Реализовано

```mermaid
flowchart TB
    Lobby -->|matrix| Game
    Connect -->|crack| Phantom
    Slug[EN/RU/UK slug] -->|btn + copy stagger| i18n
    Theme[☀/☾ Lucide] -->|full flash| DayNight[day/night tokens]
```

| API | Эффект |
|-----|--------|
| `playRouteTransition` | Matrix на весь экран |
| `playCrackModal` | Трещины + modal |
| `playLocaleSwitch(apply, btn)` | Glitch slug + stagger `.bw-locale-text` |
| `playThemeSwitch(sun/moon, apply)` | Full-screen + Lucide |

---

## Статистика

| Метрика | Значение |
|---------|----------|
| Motion-компонентов | 5 |
| GSAP hero-сцен | 3 (+ stubs win/deposit) |
| `pnpm test:motion` | 5/5 ✅ |
| `pnpm build` | ✅ |

---

## Handoff PO → Claude

```mermaid
flowchart LR
    Cursor[Cursor — сетап ит.1–2] -->|лимит $20| Claude[Claude Cloud — оператор]
    PO[PO тестирует] --> help[iterations/help.md]
    Claude --> OnChain[deploy + games]
```

PO завершает итерацию 2 в Cursor и **переключается на Claude**: стандартный included-лимит Cursor ($20) исчерпан. Дальнейшие итерации — Cloud по [`ai/HANDOFF.md`](../ai/HANDOFF.md).

---

## Ресурсы

| | |
|---|---|
| **Старт** | 30.05.2026, ~17:30 МСК (после ит.1) |
| **Финиш (PO)** | 30.05.2026 — handoff в Claude |
| **USD (Cursor AI)** | **$10** (ит.2; лимит $20 достигнут → переход в Cloud) |
| **Время PO** | **~45 мин** (ручной контроль) |

---

**Коммит (ожидается):** `feat: iteration 2 — GSAP motion, theme, locale slugs, deploy scaffold`
