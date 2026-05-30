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

---

## 2026-05-30 — Iteration 3: lobby monster hero

**Participants:** Human (PO), Claude (Cloud operator)

**Decision:** Lobby leads with a pixel-art monster holding the two game panels in its
paws (ADR-013). Idle motion stays in the **CSS flat layer** (`bw-mon-*`); GSAP remains
reserved for route/wallet/win scenes. New `components/lobby/` dir. Responsive: arms land
at 25%/75%, panel grid `1fr 1fr`, `clamp()` sizing, fits viewport at 320px → desktop.

**Open questions:** monster art is hard-coded to exactly two panels — revisit if a third
game is added.
