<template>
  <DropdownMenuRoot v-model:open="open">
    <DropdownMenuTrigger as-child>
      <button
        ref="triggerRef"
        type="button"
        class="bw-btn bw-locale-dd__trigger text-xs min-h-[44px] font-bold tracking-widest"
        :disabled="switching"
      >
        <span class="bw-locale-text">{{ slug(locale) }}</span>
        <span class="bw-locale-dd__caret" :class="{ 'is-open': open }" aria-hidden="true">▾</span>
      </button>
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent class="bw-locale-dd__menu" align="end" :side-offset="6">
        <DropdownMenuItem
          v-for="loc in locales"
          :key="loc.code"
          class="bw-locale-dd__opt"
          :class="{ 'is-active': locale === loc.code }"
          @select="choose(String(loc.code))"
        >
          {{ slug(loc.code) }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<script setup lang="ts">
/**
 * @agent-context i18n locale picker — Reka UI DropdownMenu (keyboard, focus-trap, Esc, outside
 * click, positioning for free), styled with our tokens. Locale-switch GSAP glitch runs on the
 * trigger + page-wide `.bw-locale-text` stagger.
 * @see ai/decisions/005-i18n-en-default.md, ai/specs/ui-primitives.md
 */
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'reka-ui'

const { locale, locales, setLocale } = useI18n()
const { playLocaleSwitch } = useBrutalMotion()

const switching = ref(false)
const open = ref(false)
const triggerRef = ref<HTMLElement | null>(null)

function slug(code: string) {
  return code.toUpperCase()
}

async function choose(code: string) {
  if (code === locale.value || switching.value) return
  switching.value = true
  try {
    await playLocaleSwitch(() => setLocale(code), triggerRef.value)
  } finally {
    switching.value = false
  }
}
</script>

<style scoped>
.bw-locale-dd__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.6rem;
  min-width: 0;
}

.bw-locale-dd__caret {
  font-size: 0.7rem;
  transition: transform 0.12s;
}

.bw-locale-dd__caret.is-open {
  transform: rotate(180deg);
}

.bw-locale-dd__menu {
  min-width: 4rem;
  background: var(--bw-bg);
  border: 3px solid var(--bw-border);
  box-shadow: 5px 5px 0 var(--bw-accent);
  /* header is sticky z-50; keep the portaled menu above it */
  z-index: 100;
}

.bw-locale-dd__opt {
  display: block;
  width: 100%;
  min-height: 44px;
  padding: 0.5rem 0.9rem;
  background: var(--bw-bg);
  color: var(--bw-fg);
  font-family: var(--bw-font);
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-align: left;
  cursor: pointer;
  user-select: none;
  outline: none;
}

.bw-locale-dd__opt[data-highlighted],
.bw-locale-dd__opt:hover {
  background: var(--bw-accent);
  color: var(--bw-bg);
}

.bw-locale-dd__opt.is-active {
  color: var(--bw-accent);
}

.bw-locale-dd__opt.is-active[data-highlighted] {
  color: var(--bw-bg);
}
</style>
