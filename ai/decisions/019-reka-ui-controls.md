# ADR-019: Migrate hand-rolled controls to Reka UI primitives

**Status:** accepted (partial)
**Date:** 2026-05-31

## Context

Audit found several interactive controls were hand-written although Reka UI (already a dep) ships
accessible primitives: tabs, locale dropdown, radio groups, slider, checkboxes, dialog.

## Decision

Use Reka UI styled with `--bw-*` tokens instead of hand-rolling, for keyboard/focus/aria correctness.

Done this iteration:
- **Locale picker** → `DropdownMenuRoot/Trigger/Portal/Content/Item` (was a custom dropdown).
- **Dice target** → `SliderRoot/Track/Range/Thumb` (was native `<input type=range>`).
- **Dice under/over** → `RadioGroupRoot/Item` (was two toggle buttons).
- **`BrutalTabs.vue`** wrapper over `TabsRoot/List/Trigger/Content` created (tokens + `data-state` CSS) — ready to replace the hand-rolled `role=tablist` in DiceGame/SlotGame (wire on a running dev server so any template-slot mismatch surfaces immediately).

## Remaining (next pass, low risk on dev server)

- Wire `BrutalTabs` into Dice/Slot (play/rules/fair).
- Speed 1×/2× + ∞ + stop-on-win → `ToggleGroup`/`Checkbox`.
- Crack wallet modal stays custom (GSAP-driven hero) — intentional.

## Consequences

- Reka content is portaled; scoped CSS still applies via the component's data-attr.
- All styled with brand tokens — no visual regression intended.
