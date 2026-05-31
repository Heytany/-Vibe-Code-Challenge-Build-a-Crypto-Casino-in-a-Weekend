# Итерации Brutal wibe

> **Обязательное правило:** 1 итерация = 1 коммит + 1 отчёт здесь.  
> Cursor rule: [`.cursor/rules/iterations-workflow.mdc`](../.cursor/rules/iterations-workflow.mdc)  
> Для агентов: [`ai/specs/iterations-workflow.md`](../ai/specs/iterations-workflow.md)

---

## ⚠️ Напоминание PO (каждая итерация)

Перед коммитом проверь:

- [ ] Отчёт `iterations/NN-*.md` на русском, с инфографикой и метриками внизу
- [ ] Строка в таблице ниже (коммит hash)
- [ ] [`ai/CONTEXT.md`](../ai/CONTEXT.md) обновлён
- [ ] Claude сможет продолжить по [`ai/HANDOFF.md`](../ai/HANDOFF.md)

**Тестировщику:** инструкция Phantom devnet → [`help.md`](./help.md)

**Архитектор напоминает тебе об этом перед финальным коммитом итерации.**

---

## Формат файла

```
iterations/NN-kratkoe-nazvanie.md
```

## Структура отчёта

1. **# Итерация N**
2. **Подзаголовок** — одно предложение, суть
3. **Тело** — PO → архитектор → уточнения → реализация
4. **Инфографика** — mermaid / таблицы
5. **Подвал** — токены, USD, время PO (ручной режим + логи)

## Шаблон подвала

```markdown
| | |
|---|---|
| **Токены (Cursor AI)** | … (Usage dashboard) |
| **USD** | … |
| **Время PO** | … ч (ручной контроль логов) |
```

---

## Связь с git

| Итерация | Коммит | Отчёт | Дата |
|----------|--------|-------|------|
| 1 | `feat: iteration 1 — skeleton, architecture, ai handoff` | [01-kostyak-i-arhitektura.md](./01-kostyak-i-arhitektura.md) | 30.05.2026 15:00–~17:30 МСК · $6 |
| 2 | GSAP motion, theme, locale, deploy configs | [02-gsap-motion-base.md](./02-gsap-motion-base.md) | 30.05.2026 · ~45 мин PO · $10 |
| 3 | `48e7de2` — monster lobby (Claude) | [03-monster-lobby.md](./03-monster-lobby.md) | 30.05.2026 · ~1 ч PO · ~75% лимита Cloud |
| 4 | _(вошло в it.5)_ fun mode ADR-014 | [04-fun-mode.md](./04-fun-mode.md) | — |
| 5 | `ca5fae0` — glitch roll dice + fun mode (Claude/Cursor) | [05-dice-glitch-roll.md](./05-dice-glitch-roll.md) | 30.05.2026 · **~1 ч PO · $20 Cursor** |
| 6 | `8ddfcaa` — corrupted reels slot + layout polish | [06-slot-corrupted-reels.md](./06-slot-corrupted-reels.md) | 30.05.2026 · **~15 мин PO** финал + slot hero |
| 7 | _(PO коммитит)_ — access denied UX, toasts, offline | [07-access-denied-ux.md](./07-access-denied-ux.md) | 30.05.2026 · **~30 мин PO** |
| 8 | _(PO коммитит)_ — mobile/iOS motion, provably-fair, auto-roll/fullscreen, slot split (Claude) | [08-mobile-motion-fair-automation.md](./08-mobile-motion-fair-automation.md) | 31.05.2026 · Claude (Cowork) |
| 9 | _(PO коммитит)_ — fixes: toast crash, Netlify env, word-wrap, mode header, speed radio + devnet readiness (Claude) | [09-fixes-deploy-readiness.md](./09-fixes-deploy-readiness.md) | 31.05.2026 · Claude (Cowork) |
| 10 | _(PO коммитит)_ — polish: slot split win, Reka UI, mobile header, copy, UX fixes (Claude) | [10-polish-reka-copy.md](./10-polish-reka-copy.md) | 31.05.2026 · Claude (Cowork) |
| 11 | _(PO коммитит)_ — mobile toasts, wallet modals, Phantom Phase A | [11-mobile-toasts-devnet-phase-a.md](./11-mobile-toasts-devnet-phase-a.md) | 30.05.2026 · Cursor |

**QA:** FUN — `/games/dice`, `/games/slot` без Phantom · 404 → `/games/nope`

---

## Для Claude

1. Прочитай **последний** отчёт в этой папке.
2. Продолжай нумерацию без пропусков.
3. После своей итерации — отчёт RU + обнови таблицу + `ai/CONTEXT.md`.
