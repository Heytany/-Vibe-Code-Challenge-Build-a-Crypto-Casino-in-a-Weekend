/**
 * @agent-context Placeholder pubkeys from .env.example — must not enable LIVE mode.
 * @see .env.example, composables/useCasinoProgram.ts
 */

export const PLACEHOLDER_PROGRAM_ID = 'Wibe1111111111111111111111111111111111111'
export const PLACEHOLDER_TOKEN_MINT = 'Token1111111111111111111111111111111111111'

const PLACEHOLDERS = new Set([PLACEHOLDER_PROGRAM_ID, PLACEHOLDER_TOKEN_MINT])

export function isPlaceholderPubkey(value: string | undefined | null): boolean {
  if (!value?.trim()) return true
  return PLACEHOLDERS.has(value.trim())
}

/** True when both ids are non-empty and not skeleton placeholders from .env.example. */
export function isRealChainConfig(programId: string, tokenMint: string): boolean {
  return Boolean(
    programId?.trim()
    && tokenMint?.trim()
    && !isPlaceholderPubkey(programId)
    && !isPlaceholderPubkey(tokenMint),
  )
}
