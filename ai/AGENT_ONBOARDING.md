# Agent onboarding

## 1. Read first

1. [`HANDOFF.md`](HANDOFF.md)
2. Latest report in [`iterations/`](../iterations/) (Russian — what PO saw last)
3. [`CONTEXT.md`](CONTEXT.md)
4. Task-specific [`specs/`](specs/)
5. [`specs/iterations-workflow.md`](specs/iterations-workflow.md) — **mandatory** at end of each iteration

## 2. Local setup

```bash
pnpm install
cp .env.example .env
pnpm dev                 # http://localhost:3000
pnpm test:env
pnpm test:e2e
```

### Solana / Anchor (for program work)

Requires: Rust, Solana CLI, Anchor 0.30.

```bash
anchor build
anchor test
anchor deploy --provider.cluster devnet
pnpm copy-idl
```

After deploy:

1. Copy program ID from deploy output
2. Set `NUXT_PUBLIC_CASINO_PROGRAM_ID` in `.env`
3. Create/mint devnet SPL token → set `NUXT_PUBLIC_CASINO_TOKEN_MINT`
4. Update [`CONTEXT.md`](CONTEXT.md) with deployed IDs (no secrets)

## 3. UI patterns

- **Toast / alert / accordion:** [`specs/ui-primitives.md`](specs/ui-primitives.md)
- **Brutalist styling:** [`specs/ui-brutalism.md`](specs/ui-brutalism.md)
- **Do not** build custom modal/toast DOM in pages

## 4. After your task (end of iteration)

1. Write RU report → [`iterations/NN-*.md`](../iterations/)
2. Update [`iterations/README.md`](../iterations/README.md) git table
3. Update [`CONTEXT.md`](CONTEXT.md) — done / blockers / next
4. If architecture changed → new ADR + [`DISCUSSION_LOG.md`](DISCUSSION_LOG.md)
5. One commit: `feat: iteration N — summary`
6. **Remind PO** to review iteration report before push

## 5. Deploy frontend

Vercel / Cloudflare Pages — set all `NUXT_PUBLIC_*` env vars in dashboard.
