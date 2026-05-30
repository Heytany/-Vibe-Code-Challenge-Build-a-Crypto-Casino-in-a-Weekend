/**
 * @agent-context Client-only env validation — fullscreen error if NUXT_PUBLIC_* invalid.
 * @depends tests/helpers/env-contract.ts (same zod schema)
 * @failure-modes: Missing PROGRAM_ID → lists exact key; bad URL → RPC field highlighted
 */
import { validatePublicEnv } from '~/shared/env-contract'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const result = validatePublicEnv({
    NUXT_PUBLIC_SOLANA_NETWORK: config.public.solanaNetwork as string,
    NUXT_PUBLIC_SOLANA_RPC_URL: config.public.solanaRpcUrl as string,
    NUXT_PUBLIC_CASINO_PROGRAM_ID: config.public.casinoProgramId as string,
    NUXT_PUBLIC_CASINO_TOKEN_MINT: config.public.casinoTokenMint as string,
  })

  if (result.ok) return

  const lines = [
    'Brutal wibe — environment misconfigured',
    '',
    'Fix .env (see .env.example):',
    ...result.issues.map(i => `  • ${i.path}: ${i.message}`),
  ]

  const el = document.createElement('div')
  el.className = 'bw-env-error'
  el.innerHTML = `<pre>${lines.join('\n')}</pre>`
  document.body.appendChild(el)

  console.error('[env-validation]', result.issues)
})
