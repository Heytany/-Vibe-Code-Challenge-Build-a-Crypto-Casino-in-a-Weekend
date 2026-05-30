# ADR-012: Day/night theme toggle

**Status:** accepted  
**Date:** 2026-05-30

## Context

Brutalist UI was dark-only. PO requested day/night toggle with motion, without breaking flat base layer.

## Decision

- CSS variables on `[data-bw-theme="night"|"day"]` in `assets/css/brutalism.css`
- Pinia `stores/theme.ts` + cookie `wibe_theme`
- Inline head script + `plugins/theme.client.ts` to avoid FOUC
- Toggle in header (`ThemeToggle`) — **Lucide** icons [`lucide-vue-next`](../../package.json) Sun / Moon
- Switch animated via `useBrutalMotion().playThemeSwitch()` — full-screen flash with large Lucide icon
- Locale switch uses `playLocaleSwitch(apply, buttonEl)` — GSAP pulse on slug button only (EN/RU/UK)

## Consequences

- All colors must use `--bw-*` tokens (no hardcoded #0a0a0a in components)
- Hero GSAP scenes read accent from CSS vars — work in both themes
- Reduced motion → instant theme/locale apply
