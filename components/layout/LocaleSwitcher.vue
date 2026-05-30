<template>
  <div class="flex items-center gap-1">
    <button
      v-for="loc in locales"
      :key="loc.code"
      type="button"
      class="bw-btn text-xs py-2 px-3 min-h-[44px]"
      :class="{ 'bg-[var(--bw-accent)] text-[var(--bw-bg)]': locale === loc.code }"
      :aria-pressed="locale === loc.code"
      @click="setLocale(loc.code)"
    >
      {{ loc.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context i18n locale switcher — layout-safe buttons, no fixed width.
 * @see ai/decisions/005-i18n-en-default.md
 */
const { locale, locales, setLocale } = useI18n()
</script>
