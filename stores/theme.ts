/**
 * @agent-context Day/night brutalist theme — cookie persisted, data-bw-theme on html.
 * @see ai/decisions/012-theme-day-night.md
 */
export type BwTheme = 'night' | 'day'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<BwTheme>('night')
  const cookie = useCookie<BwTheme>('wibe_theme', {
    default: () => 'night',
    sameSite: 'lax',
  })

  function applyTheme(next: BwTheme) {
    theme.value = next
    cookie.value = next
    if (import.meta.client) {
      document.documentElement.setAttribute('data-bw-theme', next)
    }
  }

  function init() {
    const stored = cookie.value === 'day' ? 'day' : 'night'
    applyTheme(stored)
  }

  function toggle(): BwTheme {
    const next: BwTheme = theme.value === 'night' ? 'day' : 'night'
    applyTheme(next)
    return next
  }

  const isNight = computed(() => theme.value === 'night')

  return {
    theme,
    isNight,
    init,
    applyTheme,
    toggle,
  }
})
