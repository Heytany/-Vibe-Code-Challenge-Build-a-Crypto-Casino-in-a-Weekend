# Brutal wibe

**Brutal wibe** (`truebrutal`) — brutalist on-chain crypto casino on **Solana devnet**. Connect Phantom, deposit test SPL tokens, play Glitch Roll (dice) and Corrupted Reels (slot), verify every roll on Solana Explorer. FUN mode works without a wallet; LIVE mode uses the deployed Anchor program.

**Live (Netlify):** [truebrutal.netlify.app](https://truebrutal.netlify.app) — deploys from GitHub, Nuxt static SPA (`pnpm build` → `.output/public`).

---

## Brutal wibe (this repo)

### Architecture

- [`AGENTS.md`](AGENTS.md) → [`ai/HANDOFF.md`](ai/HANDOFF.md) for AI agents
- [`ai/ARCHITECTURE.md`](ai/ARCHITECTURE.md) — system overview
- [`ai/PLAN.md`](ai/PLAN.md) — full plan

### Local dev

```bash
pnpm install
cp .env.example .env
pnpm dev              # http://localhost:3000
pnpm test:env         # env contract
pnpm test:motion      # GSAP / motion unit tests
pnpm test:e2e         # Playwright smoke
pnpm build            # → .output/public (static SPA)
```

### Netlify (production)

| | |
|---|---|
| **Site** | [truebrutal.netlify.app](https://truebrutal.netlify.app) |
| **Trigger** | Push to GitHub → Netlify build |
| **Build** | `pnpm build` ([`netlify.toml`](netlify.toml)) |
| **Publish** | `.output/public` |
| **Env** | 4× `NUXT_PUBLIC_*` in Netlify dashboard — see [`.env.example`](.env.example) |

FUN works without env; LIVE needs devnet program id + token mint. Details: [`ai/specs/deploy.md`](ai/specs/deploy.md).

**Tester wallet (Phantom devnet):** [`iterations/help.md`](iterations/help.md)

Solana program (requires Anchor + Rust):

```bash
anchor build && anchor test
anchor deploy --provider.cluster devnet
pnpm copy-idl
# → update NUXT_PUBLIC_CASINO_PROGRAM_ID in .env
```

### Stack

| Layer | Choice |
|-------|--------|
| Chain | Solana devnet |
| Contract | Anchor (`programs/wibe-casino`) |
| Frontend | Nuxt 3 SPA, Tailwind, Pinia, i18n |
| UI primitives | Reka UI (headless) + brutalist wrappers |
| Wallet | Phantom |

### Status

**Live on devnet** — [truebrutal.netlify.app](https://truebrutal.netlify.app). Sprint context: [`ai/CONTEXT.md`](ai/CONTEXT.md).

---

## Challenge (original)

# 🎰 Vibe-Code Challenge: Build a Crypto Casino in a Weekend (May 30–31)

Challenge brief — see original task below.

Hi! We're running a frontend-engineer assessment, and instead of LeetCode we're launching a real build challenge. **48 hours from the start: 30.05.2026 at 06:00 GMT+3.**

- 🥇 1st place: 1,000$ + offer for an AI Engineer role at an international iGaming company
- 🥈 2nd place: 500$ + candidate offer for an AI Engineer role at an international iGaming company
- 🥉 3rd place: 200$ + candidate offer for an AI Engineer role at an international iGaming company

**Task**

Build a casino on **Solana or Ethereum — your choice; both options are equally valid**. The user must be able to:

1. Connect a wallet (Phantom, MetaMask — whatever fits the chosen network)
2. Deposit test tokens into the casino
3. Play a game and win or lose tokens
4. Withdraw the balance back to their wallet

The casino logic must be **verifiable on-chain** — a paranoid player using a block explorer should be able to confirm it's not a scam. *How* you achieve this is up to you.

**Constraints**

- **Testnet only** — Solana devnet or an Ethereum testnet (Sepolia / Holesky, etc.). No real money.
- Deployed to a public URL (Vercel / Cloudflare / Netlify / anything)
- The casino has an edge — this is a casino, not a charity
- Any frontend stack you like
- **We want the product to be as polished as you can make it in 48 hours** — UX, visuals, copy, error states, everything. Build it like you're releasing tomorrow.

**Deadline:** `<1 June 2026 06:00 GMT+3>` — send your Notion page with all materials via Telegram: @ryazhenkacustomers.
