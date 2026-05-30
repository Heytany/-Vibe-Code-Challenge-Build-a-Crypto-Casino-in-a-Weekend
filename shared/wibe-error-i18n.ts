/**
 * @agent-context Map WibeErrorCode → i18n keys under errors.codes.*
 */
import { WibeErrorCode } from '~/shared/errors'

export function wibeErrorTitleKey(code: WibeErrorCode): string {
  return `errors.codes.${code}.title`
}

export function wibeErrorMessageKey(code: WibeErrorCode): string {
  return `errors.codes.${code}.message`
}
