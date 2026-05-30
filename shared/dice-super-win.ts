/**
 * @agent-context Super-win detection for dice jackpot FX (panel matrix rain).
 * Win + extreme roll (1/100) or very low win chance (≤5%).
 */
export function isDiceSuperWin(won: boolean, roll: number, winChance: number): boolean {
  if (!won) return false
  if (roll === 1 || roll === 100) return true
  return winChance <= 5
}
