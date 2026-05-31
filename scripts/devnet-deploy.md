# Devnet deploy — PO runbook

> Anchor deploy runs **on your Mac**, not Netlify. After deploy, copy Program Id + Mint into `.env` and Netlify env vars.

## 1. Toolchain (one time)

```bash
# Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
solana config set --url devnet

# Anchor 0.30
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 0.30.1 && avm use 0.30.1

# Deploy keypair (separate from Phantom)
solana-keygen new -o ~/.config/solana/id.json
solana config set --keypair ~/.config/solana/id.json
# Fund ONCE: Phantom → transfer devnet SOL, or faucet.solana.com — NO retry loops (429 ban)
```

Verify: `solana --version`, `anchor --version`.

## 2. Phantom devnet + faucet

1. Phantom → Settings → Developer → **Testnet Mode** / **Solana Devnet**.
2. Copy Phantom address → https://faucet.solana.com → **one** devnet airdrop if needed. Do not spam CLI `solana airdrop` in loops.

## 3. Build + deploy program

From repo root:

```bash
anchor keys sync
anchor build
anchor deploy --provider.cluster devnet
pnpm copy-idl
```

Record the **Program Id** printed by deploy. Update `declare_id!` in `programs/wibe-casino/src/lib.rs`, `[programs.devnet]` in `Anchor.toml`, rebuild and redeploy if ids drift.

## 4. SPL mint + initialize

Create a devnet SPL mint (recommend **0 decimals** for simple UI amounts), mint test tokens to your Phantom ATA, then call `initialize(house_edge_bps: 200)`.

See `iterations/04-plan-dice-game.md` §Шаг 0 and `tests/wibe-casino.ts` (extend with mint/init flows).

## 5. Env (local + Netlify)

```env
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NUXT_PUBLIC_CASINO_PROGRAM_ID=<real program id>
NUXT_PUBLIC_CASINO_TOKEN_MINT=<real mint>
```

Restart `pnpm dev` after changing `.env`. On Netlify: Site settings → Environment variables → redeploy.

**Do not** use placeholder `Wibe1111…` / `Token1111…` — the frontend treats them as unconfigured.

## 6. LIVE QA checklist

1. Connect Phantom (devnet).
2. Switch **LIVE** (segmented radio — requires wallet + real env).
3. **Deposit** test tokens → casino balance increases.
4. Roll/spin → confirm tx on [Explorer devnet](https://explorer.solana.com/?cluster=devnet).
5. **Withdraw** → tokens return to Phantom.

Full QA steps: [`iterations/help.md`](../iterations/help.md).
