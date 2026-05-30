/**
 * @agent-context Bet input validation — inline invalid state + toast before game action.
 */
import { WibeErrorCode } from '~/shared/errors'

export function useBetField(bet: Ref<number>) {
  const touched = ref(false)

  const invalid = computed(
    () => !Number.isFinite(bet.value) || bet.value <= 0,
  )

  function markTouched() {
    touched.value = true
  }

  function validateBetOrToast(): boolean {
    touched.value = true
    if (!invalid.value) return true
    useBrutalToast().fromCode(WibeErrorCode.InvalidBet)
    return false
  }

  return {
    touched,
    invalid,
    markTouched,
    validateBetOrToast,
  }
}
