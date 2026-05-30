<template>
  <GamesSlotGame />
</template>

<script setup lang="ts">
/**
 * @agent-context Slot game route — /games/slot
 */
const { t } = useI18n()
useHead({ title: () => `${t('games.slot.title')} · Brutal wibe` })
useSeoMeta({
  description: () => t('seo.slot.description'),
  ogTitle: () => `${t('games.slot.title')} · Brutal wibe`,
  ogDescription: () => t('seo.slot.description'),
})
</script>
