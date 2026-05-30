/**
 * @agent-context Toast API for agents — do not build custom toast DOM; call showError/showSuccess.
 * @depends UiPrimitivesBrutalToastHost in app.vue
 * @see ai/specs/ui-primitives.md
 */
import { WibeError, WibeErrorCode, WIBE_ERROR_MESSAGES } from '~/shared/errors'

export function useBrutalToast() {
  const { pushToast } = useBrutalToastQueue()

  function show(title: string, description?: string, variant: 'default' | 'error' | 'success' = 'default') {
    pushToast(title, description, variant)
  }

  function showError(error: unknown) {
    if (error instanceof WibeError) {
      pushToast(error.code, error.message, 'error')
      return
    }
    pushToast(
      WibeErrorCode.TransactionFailed,
      error instanceof Error ? error.message : 'Unknown error',
      'error',
    )
  }

  function showSuccess(title: string, description?: string) {
    pushToast(title, description, 'success')
  }

  function fromCode(code: WibeErrorCode) {
    pushToast(code, WIBE_ERROR_MESSAGES[code], 'error')
  }

  return { show, showError, showSuccess, fromCode }
}
