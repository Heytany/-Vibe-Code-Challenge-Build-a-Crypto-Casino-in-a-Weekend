/**
 * @agent-context Display helper for casino / wallet token amounts (0-decimal devnet SPL).
 */
export const TOKEN_SYMBOL = 'WIBE'

export function formatTokenAmount(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return value.toLocaleString()
}
