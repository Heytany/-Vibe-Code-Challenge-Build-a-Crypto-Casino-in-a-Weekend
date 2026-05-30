<template>
  <GamesDiceGame />
</template>

<script setup lang="ts">
/**
 * @agent-context Dice game route — /games/dice
 */
const { t } = useI18n()
useHead({ title: () => `${t('games.dice.title')} · Brutal wibe` })
useSeoMeta({
  description: () => t('seo.dice.description'),
  ogTitle: () => `${t('games.dice.title')} · Brutal wibe`,
  ogDescription: () => t('seo.dice.description'),
})
</script>
