# ADR-009: Reka UI for headless UI primitives

**Status:** accepted  
**Date:** 2026-05-30

## Context

Agents repeatedly building toasts, error dialogs, accordions, and lists from scratch adds noise and hurts a11y. Brutal wibe needs full visual control (brutalist / broken aesthetic).

## Decision

Use **Reka UI** (`reka-ui` + `reka-ui/nuxt` module) as unstyled headless primitives. Brutalist styling lives in thin wrappers under `components/ui/primitives/`.

## Rationale

- Headless — no design system conflict with brutalism
- Nuxt module auto-imports components — less boilerplate for agents
- Built-in a11y (focus trap, keyboard, ARIA) for dialogs/accordions
- Agents call `useBrutalToast()` / `<UiPrimitivesBrutalAlert>` instead of inventing DOM

## Wrappers (use these, not raw Reka in pages)

| Need | Wrapper / API |
|------|----------------|
| Toast | `useBrutalToast()` |
| Blocking error | `<UiPrimitivesBrutalAlert v-model:open="..." />` |
| Accordion / FAQ / footnotes | `<UiPrimitivesBrutalAccordion :items="..." />` |
| Custom buttons/panels | Existing `UiBrutalButton`, `UiBrokenPanel` (no Reka) |

## Consequences

- Extra dependency (~headless only)
- `ConfigProvider` + `useId()` in `app.vue`
- New spec: `ai/specs/ui-primitives.md`

## Do not

- Style Reka components inline in pages — extend wrappers
- Replace game-specific glitch UI with Reka
