# Sprint context (live)

**Last updated:** 2026-05-30 — iteration 2 complete  
**Project name:** Brutal wibe  
**Current iteration:** 2 → [`iterations/02-gsap-motion-base.md`](../iterations/02-gsap-motion-base.md)

## Dev server

```bash
pnpm install
cp .env.example .env
pnpm dev          # http://localhost:3000 — auto-opens browser
```

**Note:** `ssr: false` requires `experimental.viteEnvironmentApi: true` in `nuxt.config.ts`.

## Done

- [x] Iteration 1 skeleton (see iteration 1 report)
- [x] GSAP motion layer — matrix route + crack wallet (ADR-011)
- [x] `useBrutalMotion()` API + win/deposit stubs
- [x] Reduced-motion fallbacks
- [x] `pnpm test:motion`

## Not done

- [ ] Deploy program to devnet
- [ ] Wire `useCasinoProgram` / games
- [ ] `playWinBurst` / `playDepositPulse` implementation (it.3)
- [ ] Live URL deployment

## Priority order

1. Commit iteration 2 → handoff Claude  
2. Deploy + env IDs  
3. Deposit/withdraw + dice  
4. Slot + win/deposit animations  
