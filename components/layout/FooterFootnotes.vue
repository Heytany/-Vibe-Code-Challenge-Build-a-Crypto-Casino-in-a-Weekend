<template>
  <footer class="border-t-4 border-[var(--bw-border)] mt-auto py-8 bg-[var(--bw-bg)]">
    <div class="container mx-auto px-4 max-w-5xl space-y-6">
      <p class="text-sm text-[var(--bw-muted)] uppercase tracking-wider">
        {{ t('footer.tagline') }}
      </p>

      <UiPrimitivesBrutalAccordion :items="accordionItems" />

      <p class="text-xs text-[var(--bw-muted)] pt-4 border-t border-[var(--bw-muted)]/30">
        Brutal wibe · Solana devnet · {{ t('footer.disclaimer') }}
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
/**
 * @agent-context Footer footnotes — Reka Accordion wrapper for expandable notes.
 * @see ai/decisions/009-reka-ui-headless.md, ai/specs/ui-brutalism.md
 */
const { t } = useI18n()

const accordionItems = computed(() => [
  { value: '1', title: `[1] ${t('footer.notes.broken').slice(0, 40)}…`, content: t('footer.notes.broken') },
  { value: '2', title: `[2] ${t('footer.notes.onchain').slice(0, 40)}…`, content: t('footer.notes.onchain') },
  { value: '3', title: `[3] ${t('footer.notes.houseEdge').slice(0, 40)}…`, content: t('footer.notes.houseEdge') },
  { value: '4', title: `[4] ${t('footer.notes.hacker').slice(0, 40)}…`, content: t('footer.notes.hacker') },
])
</script>
