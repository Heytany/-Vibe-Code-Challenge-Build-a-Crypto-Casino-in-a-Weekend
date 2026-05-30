# ADR-013: Lobby monster hero (pixel-art, CSS-only idle motion)

**Status:** accepted
**Date:** 2026-05-30

## Context

PO wants the lobby to lead with a screen-filling animated pixel-art monster that
"holds" one game panel in each paw (2 games → 2 panels). On load the user must see
header + games block + animated monster within the viewport, on all resolutions.

## Decision

- New component `components/lobby/MonsterHero.vue` (auto-import prefix `Lobby`).
  Decorative inline SVG (`shape-rendering="crispEdges"`, `aria-hidden`), filled with
  `--bw-*` tokens so it inverts for day/night automatically.
- Two named slots `#left` / `#right` receive the game panels; the monster's arms land
  at **25% / 75%** of the stage width, aligned to a `1fr 1fr` panel grid, so the paws
  grip the panel tops at every width. Panels tuck under the paws via negative margin.
- **Idle motion is CSS-only** (flat brutalist layer: breathe, blink, arm/paw bob,
  antenna flicker, glitch slice, plus 8 writhing tentacles) — added to
  `assets/css/brutalism.css` as `bw-mon-*`. GSAP (`useBrutalMotion`) stays reserved for
  route / wallet / win-deposit hero scenes.
- **Tentacles:** 4 per side (`--la/lb/lc/ld` + mirror), varied length/thickness, sine
  curvature, accent glitch tips. They reach to viewBox x=0..320 (= panel-area edges, =
  screen edges on mobile) but never beyond — verified no horizontal overflow at 320px+.
  Each twitches on its own duration/phase (`bw-mon-twitch-a/-b`), pivoting at the body.
- Viewport fit via fluid `clamp()` sizing + `min-height: calc(100vh - 15rem)` centering.
- Game cards remain real `<button>`s that call `playRouteTransition(to, 'matrix')` and
  keep `UiLocaleText` (locale stagger + e2e smoke names intact).

## Consequences

- `prefers-reduced-motion` disables all `bw-mon-*` animations (added to the existing guard).
- No new runtime deps; SVG is hand-authored, no asset pipeline.
- Future games (>2) would need a new arm/paw layout — current art is fixed to two panels.
