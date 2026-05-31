# ADR-018: iOS-safe viewport-anchored motion overlays

**Status:** accepted
**Date:** 2026-05-31

## Context

On iOS Safari the visual viewport ≠ layout viewport (address bar, pinch-zoom). The matrix
transition wasn't covering the full screen and the crack modal drifted off-centre; the sticky
header could detach during rubber-band scroll.

## Decision

- `shared/motion.ts` `getVisualViewport()` + `composables/useViewportAnchor.ts` size & translate
  fixed overlays to the **visual viewport** (matrix overlay + crack backdrop), updating on
  `visualViewport` resize/scroll.
- Canvas + crack centre use visual-viewport dimensions; matrix glitch bars span the full screen.
- CSS: `100dvh` fallback, `overscroll-behavior: none` on html/body (stops the rubber-band that
  peels the sticky header), and `touch-action: none` while motion-locked.

## Consequences

- Desktop unchanged (visual viewport == innerWidth/Height, offset 0).
- True on-device iOS verification still pending (sandbox cannot emulate Safari chrome).
