<template>
  <div ref="rootRef" class="bw-locale-switcher flex items-center gap-1">
    <button
      v-for="loc in locales"
      :key="loc.code"
      :ref="(el) => setBtnRef(String(loc.code), el)"
      type="button"
      class="bw-btn bw-locale-slug text-xs py-2 px-3 min-h-[44px] min-w-[44px] font-bold tracking-widest"
      :class="{ 'is-active bg-[var(--bw-accent)] text-[var(--bw-bg)]': locale === loc.code }"
      :aria-pressed="locale === loc.code"
      :aria-label="String(loc.name)"
      :disabled="switching"
      @click="onSelect(String(loc.code))"
    >
      <span class="bw-locale-slug bw-locale-text">{{ slug(loc.code) }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context i18n locale slugs (EN/RU/UK) — GSAP only on clicked slug button.
 * @see ai/decisions/005-i18n-en-default.md
 */
const { locale, locales, setLocale } = useI18n()
const { playLocaleSwitch } = useBrutalMotion()
const switching = ref(false)
const btnRefs = ref<Record<string, HTMLElement | null>>({})

function slug(code: string) {
  return code.toUpperCase()
}

function setBtnRef(code: string, el: unknown) {
  btnRefs.value[code] = el as HTMLElement | null
}

async function onSelect(code: string) {
  if (code === locale.value || switching.value) return
  switching.value = true
  const button = btnRefs.value[code] ?? null
  try {
    await playLocaleSwitch(() => setLocale(code), button)
  } finally {
    switching.value = false
  }
}
</script>

<style scoped>
.bw-locale-switcher {
  position: relative;
  isolation: isolate;
}

.bw-locale-slug {
  font-variant-numeric: tabular-nums;
}
</style>
