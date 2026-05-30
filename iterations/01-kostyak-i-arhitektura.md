# Итерация 1

## Костяк Brutal wibe: архитектура, AI-handoff, brutalist UI shell и on-chain scaffold

---

## Что происходило

### Твоё видение (PO)

- Участие в **Vibe-Code Challenge** — crypto casino за 48ч, verifiable on-chain.
- Ты — **Nuxt/Vue-разработчик** и консультант; Cursor — **главный архитектор**; Claude в IDE — **implementer**.
- **AI-first:** вся «память» в `ai/`, в коде — только `@agent-context` headers.
- **Human-min:** env + тесты как диагностика для агентов; папка `ai/` отдельно от кода.
- **Стиль:** brutalist, «сломанный», но удобный; meta-narrative в **footer footnotes**.
- **i18n:** EN default, RU/UK stubs, layout-safe строки.
- **Название:** **Brutal wibe** (не просто Wibe).
- **Reka UI** для toast/alert/accordion — если не ломает вайб (headless + наши обёртки).
- Handoff для Claude: PLAN, DISCUSSION_LOG, ADR.

### Как я это понял (архитектор)

| Решение | Выбор |
|---------|--------|
| Chain | Solana devnet + Anchor (быстрее EVM за 48ч) |
| Frontend | Nuxt 3 SPA (`ssr: false`), Tailwind, Pinia, i18n |
| Игры MVP | 2: Dice «Glitch Roll» + Slot «Corrupted Reels» |
| UI primitives | Reka UI → `components/ui/primitives/*` |
| Документация | `ai/` + `AGENTS.md` + 9 ADR |

### Уточнения по ходу

1. **Solana vs Ethereum** — ты доверил выбор архитектору → Solana.
2. **2 игры** — полноценные, не stub.
3. **Brutal wibe** — display name в UI и docs.
4. **Reka UI** — ADR-009, обёртки + `useBrutalToast()`.
5. **Dev 500** — баг Nuxt 3.21.3+ + `ssr: false` → fix: `experimental.viteEnvironmentApi: true`.
6. **Итерации** — отчёты RU в `iterations/`, 1 итерация = 1 коммит (это правило закреплено в итерации 1 post-factum).

### Что реализовано

```mermaid
flowchart TB
    subgraph fe [Frontend Nuxt 3]
        Lobby[Lobby /]
        Dice[/games/dice]
        Slot[/games/slot]
        UI[Brutalist UI + Reka wrappers]
    end
    subgraph chain [On-chain]
        Program[wibe_casino Anchor]
    end
    subgraph docs [Agent memory]
        AI[ai/ HANDOFF PLAN ADR specs]
        ITER[iterations/]
    end
    subgraph qa [Diagnostics]
        ENV[test:env]
        E2E[test:e2e]
    end
    Lobby --> Dice
    Lobby --> Slot
    fe --> Program
    docs --> fe
    qa --> fe
```

---

## Статистика итерации

| Метрика | Значение |
|---------|----------|
| Файлов в репо (новых) | ~75+ |
| ADR | 9 |
| AI specs | 6 |
| Anchor instructions | 5 (initialize, deposit, withdraw, play_dice, play_slot) |
| Vue routes | 3 |
| Locales | EN, RU, UK |
| `pnpm test:env` | 2/2 ✅ |
| `pnpm test:e2e` | 3/3 ✅ |
| `pnpm build` | ✅ |
| `pnpm dev` | ✅ (после fix viteEnvironmentApi) |

### Структура репозитория (ключевое)

| Путь | Назначение |
|------|------------|
| `programs/wibe-casino/` | Anchor program |
| `composables/` | wallet, casino, games, toast |
| `components/ui/primitives/` | Reka brutalist wrappers |
| `ai/` | Handoff для Claude |
| `iterations/` | Отчёты для людей (RU) |
| `tests/` | env contract + Playwright |

### Не в scope итерации 1

- Deploy на devnet
- Живые deposit/play/withdraw
- Polish анимаций
- Production URL

---

## Напоминание PO (консистентность)

> **Перед коммитом итерации N:** проверь отчёт в `iterations/`, таблицу в `iterations/README.md`, `ai/CONTEXT.md`.  
> **Claude:** читай последний отчёт + [`ai/specs/iterations-workflow.md`](../ai/specs/iterations-workflow.md).

---

## Ресурсы

| | |
|---|---|
| **Старт** | 30.05.2026, **15:00 МСК** |
| **Финиш итерации 1** | 30.05.2026, **~17:30 МСК** (оценка) |
| **Время PO** | **~2.5 ч** — ручной режим, контроль логов агента |
| **Токены (Cursor AI)** | см. Cursor → Settings → Usage |
| **USD (Cursor AI)** | **$6** |

*Поправь финиш/длительность, если сессия закончилась позже.*

---

**Коммит:** `feat: iteration 1 — skeleton, architecture, ai handoff`  
**Дата:** 2026-05-30
