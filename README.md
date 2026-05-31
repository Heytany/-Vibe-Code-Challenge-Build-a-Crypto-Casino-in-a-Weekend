# Brutal wibe

**Brutal wibe** (`truebrutal`) — brutalist on-chain crypto casino on **Solana devnet**. Connect Phantom, deposit test SPL tokens, play Glitch Roll (dice) and Corrupted Reels (slot), verify every roll on Solana Explorer. FUN mode works without a wallet; LIVE mode uses the deployed Anchor program.

**Live (Netlify):** [truebrutal.netlify.app](https://truebrutal.netlify.app) — deploys from GitHub, Nuxt static SPA (`pnpm build` → `.output/public`).

---

## How to play (devnet)

No real money — this runs on **Solana devnet** only. Tokens and SOL are test-only.

### FUN mode — zero setup

Open [truebrutal.netlify.app](https://truebrutal.netlify.app) and play **Glitch Roll** or **Corrupted Reels**. No wallet, no tokens — virtual credits, same FNV-1a RNG as on-chain. Default mode.

### LIVE mode — real on-chain play (Phantom + devnet)

1. **Install a wallet — Phantom** ([phantom.app](https://phantom.app), browser extension or mobile app). On mobile, open the site inside Phantom → *Menu → Browser*.
2. **Switch Phantom to Devnet:** *Settings → Developer Settings → Testnet Mode* (or select **Solana Devnet**).
3. **Get devnet SOL** (for transaction fees): copy your address → [faucet.solana.com](https://faucet.solana.com) → Devnet → airdrop ~1 SOL.
4. **Get WIBE test tokens** — the casino chip. There is **no public WIBE faucet**; the operator sends you some (see below). WIBE mint: `He66seATY4XobvcwC8WZceMH3uncAqEx44T8HtLyttox`. In Phantom it may show as “Unknown Token” until metadata refreshes — that's WIBE.
5. **Connect** on the site → switch to **LIVE** → **Deposit** WIBE into the casino → play. Your casino balance lives on-chain (a `UserBalance` PDA), not in your wallet.
6. **Withdraw** any time to send WIBE back to your wallet. Every roll is verifiable in the **Fair** tab and on [Solana Explorer](https://explorer.solana.com/?cluster=devnet).

> Each bet is a real on-chain transaction → Phantom asks you to approve every roll. That's the “provably on-chain” trade-off, not a bug.

### Operator: fund a tester with WIBE

From the wallet that holds WIBE (the deploy wallet, ~10 000 from `pnpm devnet:setup`):

```bash
spl-token transfer He66seATY4XobvcwC8WZceMH3uncAqEx44T8HtLyttox 1000 <TESTER_ADDRESS> \
  --url devnet --fund-recipient --allow-unfunded-recipient
```

(0 decimals → `1000` = 1000 WIBE.) Tester guide: [`iterations/help.md`](iterations/help.md).

### WIBE Wheel — the free faucet (`/games/wheel`)

Out of WIBE? You don't have to ping the operator. The **WIBE Wheel** is an on-chain faucet that drops free chips straight onto your casino balance — once every 24h, no deposit, no bet.

How it works on the game page:

1. **Connect Phantom (devnet) and switch to LIVE.** The wheel is a real on-chain instruction (`spin_wheel`), so it needs a wallet — there's no FUN version of the faucet.
2. **Hit Spin.** Phantom asks you to approve one transaction. You pay **only SOL**, never WIBE: a tiny network fee, plus — on your *first ever* spin — a one-time rent deposit (~0.001–0.002 SOL) for the two accounts the spin creates: your `FaucetClaim` (stores the 24h cooldown) and your `UserBalance` (your casino balance, if you never deposited before). Second spin onward: just the fee.
3. **Win 1–1000 WIBE.** The wheel lands on a skewed prize and the program credits it to your on-chain `UserBalance` and decrements the shared prize pool (`faucet.remaining`). No SPL tokens move on the spin itself — the prize is a balance credit. To pull it into your wallet, do a normal **Withdraw** (that's when the vault actually pays out, which is why the pool is pre-funded).
4. **24h cooldown.** Enforced on-chain via the cluster clock, per wallet. The page shows the time left; the lobby banner disables itself when the shared pool runs dry.

Operator: the pool is initialized once with `pnpm devnet:faucet` (default 3333 WIBE) and the casino vault must hold at least that much WIBE so withdrawals of wheel winnings stay solvent.

### Why you can trust it (provably fair)

The whole point of the challenge: a paranoid player with a block explorer should be able to prove it's not a scam. Here's what makes Brutal wibe verifiable rather than "trust me":

- **The RNG is deterministic and reproducible.** Every roll is `FNV-1a(blockhash · user_seed · nonce · domain)` — no hidden server seed, no off-chain oracle. The same inputs always produce the same result, on-chain and in the client mirror ([`shared/rng-verify.ts`](shared/rng-verify.ts)).
- **The program emits the exact blockhash it used.** `DicePlayed` / `SlotPlayed` / `WheelSpun` events carry the literal `blockhash: [u8; 32]` the contract hashed. So the client doesn't *guess* which blockhash to recompute against — it uses the one the chain committed to. That's what makes the **Fair** tab match a live roll byte-for-byte.
- **You supply half the entropy.** Your `user_seed` is generated client-side per play, so the house can't pre-compute or cherry-pick outcomes in your favor or against you.
- **The house edge is on-chain and visible.** Dice/slot payouts apply a fixed `house_edge_bps` set at `initialize` — it's in the program, not a UI knob. A casino has an edge by design; here you can read exactly what it is.
- **Anyone can re-derive a result independently:** pull the tx from [Solana Explorer](https://explorer.solana.com/?cluster=devnet), read the emitted `blockhash`, `user_seed`, `nonce`, and run the same FNV-1a — the Fair tab does this in-browser, but the math is public and you can do it yourself.

Honest scope note: the **Wheel is deliberately *not* presented as a fair-verify game.** Its prize curve is skewed (small wins are common, the 1000 jackpot is rare) — that's a faucet giveaway, not a bet you can lose, so there's no "fairness" to contest. It's still fully on-chain and auditable (`WheelSpun` emits the blockhash and prize), but it intentionally lives outside the Fair tab. Dice and Slot are the games where the provably-fair guarantee matters, and that's where it's wired.

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
| **Env** | In [`netlify.toml`](netlify.toml) (devnet ids) or override in Netlify dashboard |

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

**Live on devnet** — [truebrutal.netlify.app](https://truebrutal.netlify.app). FUN + LIVE + WIBE Wheel. Final report: [`iterations/19-final-marathon.md`](iterations/19-final-marathon.md) · QA: [`iterations/help.md`](iterations/help.md).

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
