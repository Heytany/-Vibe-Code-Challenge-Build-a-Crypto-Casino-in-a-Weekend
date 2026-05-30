/**
 * @agent-context Toast API for agents — do not build custom toast DOM; call showError/showSuccess.
 * @depends UiPrimitivesBrutalToastHost in app.vue
 * @see ai/specs/ui-primitives.md
 */
import { WibeError, WibeErrorCode, WIBE_ERROR_MESSAGES } from '~/shared/errors'
import { wibeErrorMessageKey, wibeErrorTitleKey } from '~/shared/wibe-error-i18n'

export function useBrutalToast() {
  const { pushToast } = useBrutalToastQueue()
  const { t, te } = useI18n()

  function show(title: string, description?: string, variant: 'default' | 'error' | 'success' = 'default') {
    pushToast(title, description, variant)
  }

  function resolveWibeError(error: WibeError) {
    const titleKey = wibeErrorTitleKey(error.code)
    const messageKey = wibeErrorMessageKey(error.code)
    const title = te(titleKey) ? t(titleKey) : t('errors.unknown.title')
    const fallbackMessage = WIBE_ERROR_MESSAGES[error.code]
    const message =
      error.message && error.message !== fallbackMessage
        ? error.message
        : te(messageKey)
          ? t(messageKey)
          : t('errors.unknown.message')
    return { title, message }
  }

  function showError(error: unknown) {
    if (error instanceof WibeError) {
      const { title, message } = resolveWibeError(error)
      pushToast(title, message, 'error')
      return
    }
    pushToast(
      t('errors.unknown.title'),
      error instanceof Error ? error.message : t('errors.unknown.message'),
      'error',
    )
  }

  function showSuccess(title: string, description?: string) {
    pushToast(title, description, 'success')
  }

  function showWin(delta: number | null, superWin = false) {
    if (delta === null) return
    pushToast(
      t('toast.win.title'),
      superWin ? t('toast.win.super', { delta }) : t('toast.win.message', { delta }),
      'success',
    )
  }

  function fromCode(code: WibeErrorCode) {
    const titleKey = wibeErrorTitleKey(code)
    const messageKey = wibeErrorMessageKey(code)
    pushToast(
      te(titleKey) ? t(titleKey) : t('errors.unknown.title'),
      te(messageKey) ? t(messageKey) : WIBE_ERROR_MESSAGES[code],
      'error',
    )
  }

  return { show, showError, showSuccess, showWin, fromCode }
}
