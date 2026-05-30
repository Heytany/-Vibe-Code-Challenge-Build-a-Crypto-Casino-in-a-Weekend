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
| 5 | feat: iteration 5 — glitch roll dice (ожидает коммита) | [05-dice-glitch-roll.md](./05-dice-glitch-roll.md) · live: [04-plan-dice-game.md](./04-plan-dice-game.md) | 30.05.2026 · **~1 ч PO · $20 Cursor** · Cloud недоступен |

**QA / PO:** [help.md](./help.md) — FUN dice: `/games/dice` без Phantom; LIVE — после deploy

---

## Для Claude

1. Прочитай **последний** отчёт в этой папке.
2. Продолжай нумерацию без пропусков.
3. После своей итерации — отчёт RU + обнови таблицу + `ai/CONTEXT.md`.
