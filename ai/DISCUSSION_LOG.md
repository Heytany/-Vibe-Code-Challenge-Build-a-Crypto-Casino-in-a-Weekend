# Discussion log (append-only)

## 2026-05-30 — Initial architecture session

**Participants:** Human (PO/Nuxt consultant), Cursor (architect)

**Topics:**

- Stack → Solana devnet + Anchor + Nuxt 3 SPA
- Games → 2 (Dice + Broken Slot)
- UI → brutalist / broken-but-usable, footnotes in footer
- i18n → EN default, RU/UK stubs
- AI workflow → docs in `ai/`, env + tests for diagnostics
- Handoff → PLAN, DISCUSSION_LOG, ADRs committed to git

**Open questions:** none

---

## 2026-05-30 — Project naming

**Decision:** Display name **Brutal wibe** (package `brutal-wibe`).

---

## 2026-05-30 — Reka UI for primitives

**Participants:** Human, Cursor

**Decision:** Use Reka UI headless + brutalist wrappers for toast, alert, accordion (ADR-009).

**Open questions:** none

---

## 2026-05-30 — Iterations workflow (mandatory)

**Decision:** `iterations/` — RU reports with infographics; 1 iteration = 1 commit (ADR-010).

**Reminder:** Architect prompts PO to review report before commit. Claude reads latest iteration + `ai/specs/iterations-workflow.md`.
