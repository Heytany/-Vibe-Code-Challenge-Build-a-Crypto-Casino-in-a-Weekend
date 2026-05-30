# Sprint context (live)

**Last updated:** 2026-05-30 — iteration 3 (Claude/Cloud operator, first pass)  
**Project name:** Brutal wibe  
**Current iteration:** 3 → [`iterations/03-monster-lobby.md`](../iterations/03-monster-lobby.md)

## Iteration 3 (this commit when PO signs off)

- [x] `components/lobby/MonsterHero.vue` — pixel-art monster holds both game panels (ADR-013)
- [x] Lobby rewritten around monster, fits viewport 320px → desktop, day/night safe
- [x] CSS-only idle motion `bw-mon-*` (GSAP still reserved for route/wallet/win)
- [x] `lobby.tagline` in en/ru/uk
- [x] Monster made more brutal — 8 writhing tentacles (varied size, sine curves), within panel area
- [x] **SEO:** monster-face `favicon.svg` + `favicon-32.png` + `apple-touch-icon.png` + `og-image.png`; OG/Twitter/theme-color meta in `nuxt.config.ts`; per-page `useSeoMeta` (i18n `seo.*`)
- [x] **Games prep:** `shared/rng-verify.ts` (+`tests/rng-verify.test.ts`), `playWinBurst`/`playDepositPulse` implemented, `games.*` i18n, `ai/specs/games-implementation.md`
- [ ] **PO:** on host run `pnpm build`, `pnpm test:e2e`, `pnpm test:motion`, `pnpm exec vitest run tests/rng-verify.test.ts`, then commit
- [ ] **Blocker:** stale `.git/index.lock` must be removed before any commit (see below)

## Next iteration — glitch games (ready to build)

Everything needed is scaffolded — see [`specs/games-implementation.md`](specs/games-implementation.md).
Order: deploy program → set env + IDL → wire `useCasinoProgram` (deposit/withdraw/play) →
fill `useGameDice`/`useGameSlot` → build Dice/Slot UI + "verify on Explorer" via `shared/rng-verify.ts`.

> **Git note:** an empty `.git/index.lock` is blocking commits. Remove it on host:
> `rm -f .git/index.lock`. Sandbox could not delete it (filesystem perms).

## Handoff note (PO)

Iteration 2 scoped in Cursor. **PO switches to Claude (Cloud)** — standard Cursor included limit (**$20**) reached; **~$10** and **~45 min PO** spent on iteration 2. Cloud continues from [`HANDOFF.md`](HANDOFF.md).

## Roles (Spark model)

| Agent | Role |
|-------|------|
| **Cursor** | Setup, architecture, `ai/`, env contract, motion foundation, deploy configs |
| **Claude (Cloud)** | Operator — on-chain, game logic, polish, live deploy URL |
| **Human (PO)** | UI testing, iteration reports, Phantom QA — see [`iterations/help.md`](../iterations/help.md) |

## Dev server

```bash
pnpm install
cp .env.example .env
pnpm dev          # http://localhost:3000
```

**Note:** `ssr: false` requires `experimental.viteEnvironmentApi: true` in `nuxt.config.ts`.

## Iteration 2 scope (this commit when PO signs off)

- [x] GSAP matrix route + crack wallet modal
- [x] Jagged crack geometry + desktop 3D modal
- [x] Day/night theme + Lucide icons (`lucide-vue-next`)
- [x] Locale motion — slug glitch + `UiLocaleText` stagger
- [x] Deploy configs + CI + [`iterations/help.md`](../iterations/help.md)
- [ ] PO final commit `feat: iteration 2 — …` (может сделать Claude после pull)

**PO metrics (it.2):** ~45 min · **$10 Cursor** · handoff reason: **$20 limit hit**

## Cloud — after iteration 2 commit

- [ ] Deploy `wibe_casino` to devnet → real `NUXT_PUBLIC_CASINO_PROGRAM_ID`
- [ ] Wire `useCasinoProgram` / games
- [ ] `playWinBurst` / `playDepositPulse`
- [ ] Live URL on Vercel/Netlify/Cloudflare

## Motion rule

Pages never import GSAP — extend `useBrutalMotion` + `MotionRoot`.

## Commands

```bash
pnpm test:env && pnpm test:motion && pnpm build && pnpm test:e2e
```

Deploy: [`specs/deploy.md`](specs/deploy.md)
