# Deploy — Brutal wibe (SPA)

**Mode:** Nuxt 3 `ssr: false` → static client bundle in `.output/public` after `pnpm build`.

## Required env (hosting dashboard)

| Variable | Example |
|----------|---------|
| `NUXT_PUBLIC_SOLANA_NETWORK` | `devnet` |
| `NUXT_PUBLIC_SOLANA_RPC_URL` | `https://api.devnet.solana.com` |
| `NUXT_PUBLIC_CASINO_PROGRAM_ID` | base58 program id after `anchor deploy` |
| `NUXT_PUBLIC_CASINO_TOKEN_MINT` | SPL mint on devnet |

Copy from [`.env.example`](../../.env.example). For **LIVE devnet** on Netlify/Vercel, set all four vars to real values (see comments in `.env.example`). Placeholders or empty → FUN-only; partial config → fatal overlay.

## Vercel (recommended)

1. Import Git repo
2. Framework preset: **Nuxt** (see [`vercel.json`](../../vercel.json))
3. Add all four `NUXT_PUBLIC_*` variables for **Production** (and Preview if needed)
4. Deploy — URL appears in dashboard

## Netlify

1. Connect repo
2. [`netlify.toml`](../../netlify.toml) sets build + SPA fallback
3. Set env vars in Site settings → Environment variables
4. Deploy

## Cloudflare Pages

1. Connect repo
2. Build command: `pnpm build`
3. Output directory: `.output/public`
4. Env vars in Pages → Settings
5. SPA routing: add redirect rule `/* /index.html 200` in dashboard if needed

## Local production check

```bash
pnpm build
pnpm preview    # or pnpm dev:preview
pnpm test:e2e   # builds + preview + Playwright
```

## CI

GitHub Actions [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml): env contract → motion tests → build → e2e.

## After deploy

1. Put live URL in [`ai/CONTEXT.md`](../CONTEXT.md)
2. Add row to [`iterations/README.md`](../../iterations/README.md) if PO demo milestone
3. Test wallet connect on deployed URL (HTTPS required for Phantom)
