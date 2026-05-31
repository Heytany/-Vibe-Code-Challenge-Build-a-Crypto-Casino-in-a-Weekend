<template>
  <GamesWheelGame />
</template>

<script setup lang="ts">
/**
 * @agent-context WIBE Wheel route — /games/wheel (free faucet spin → casino balance).
 */
const { t } = useI18n()
useHead({ title: () => `${t('games.wheel.title')} · Brutal wibe` })
</script>
