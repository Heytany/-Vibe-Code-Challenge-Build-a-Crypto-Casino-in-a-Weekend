<template>
  <GamesSlotGame />
</template>

<script setup lang="ts">
/**
 * @agent-context Slot game route — /games/slot
 */
const { t } = useI18n()
useHead({ title: () => `${t('games.slot.title')} · Brutal wibe` })
</script>
