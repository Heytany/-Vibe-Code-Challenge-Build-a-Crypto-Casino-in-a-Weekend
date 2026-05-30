/** Theme flash overlay jobs */

export type ThemeFlashIcon = 'sun' | 'moon'

export interface ThemeFlashJob {
  icon: ThemeFlashIcon
  apply: () => void | Promise<void>
  resolve: () => void
}

export const THEME_FLASH_DURATION = 0.55

export const LOCALE_SWITCH_DURATION = 0.32
