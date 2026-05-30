<template>
  <button
    type="button"
    class="bw-btn text-xs py-2 px-3 min-h-[44px] min-w-[44px] flex items-center justify-center"
    :aria-pressed="!themeStore.isNight"
    :aria-label="themeStore.isNight ? t('theme.switchToDay') : t('theme.switchToNight')"
    :title="themeStore.isNight ? t('theme.switchToDay') : t('theme.switchToNight')"
    @click="onToggle"
  >
    <Sun
      v-if="themeStore.isNight"
      :size="18"
      :stroke-width="2.5"
      aria-hidden="true"
    />
    <Moon
      v-else
      :size="18"
      :stroke-width="2.5"
      aria-hidden="true"
    />
    <span class="sr-only">{{ themeStore.isNight ? t('theme.day') : t('theme.night') }}</span>
  </button>
</template>

<script setup lang="ts">
/**
 * @agent-context Day/night theme toggle — Lucide icons + full-screen theme flash.
 * @see stores/theme.ts, ai/decisions/012-theme-day-night.md
 */
import { Moon, Sun } from 'lucide-vue-next'

const { t } = useI18n()
const themeStore = useThemeStore()
const { playThemeSwitch } = useBrutalMotion()

async function onToggle() {
  const next: 'day' | 'night' = themeStore.isNight ? 'day' : 'night'
  const icon = next === 'day' ? 'sun' : 'moon'
  await playThemeSwitch(icon, () => themeStore.applyTheme(next))
}
</script>
