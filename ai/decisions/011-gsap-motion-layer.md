# ADR-011: GSAP motion layer

**Status:** accepted  
**Date:** 2026-05-30

## Decision

Add `gsap` + `useBrutalMotion()` + motion components for hero scenes (matrix route, crack wallet).

## Rationale

Brutal wibe = flat UI + selective hyper-animation. Central API for Claude (win/deposit stubs ready).

## Consequences

- `plugins/gsap.client.ts` client-only
- `experimental.viteEnvironmentApi` unchanged (Nuxt dev fix from it.1)
- Reka Alert stays for errors; crack modal = wallet only
