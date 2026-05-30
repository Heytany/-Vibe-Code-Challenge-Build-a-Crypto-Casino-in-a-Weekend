# Sprint context (live)

**Last updated:** 2026-05-30 — iteration 2 handoff to Claude  
**Project name:** Brutal wibe  
**Current iteration:** 2 → [`iterations/02-gsap-motion-base.md`](../iterations/02-gsap-motion-base.md)

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
