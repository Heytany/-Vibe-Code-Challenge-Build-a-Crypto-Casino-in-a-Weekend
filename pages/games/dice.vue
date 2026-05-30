<template>
  <GamesDiceGame />
</template>

<script setup lang="ts">
/**
 * @agent-context Dice game route — /games/dice
 */
const { t } = useI18n()
useHead({ title: () => `${t('games.dice.title')} · Brutal wibe` })
</script>
