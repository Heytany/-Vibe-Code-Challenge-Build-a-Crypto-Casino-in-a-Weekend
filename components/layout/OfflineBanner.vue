<template>
  <div
    v-if="!online"
    class="bw-offline-banner"
    role="status"
  >
    <UiLocaleText path="errors.offline.banner" tag="span" />
  </div>
</template>

<script setup lang="ts">
const { online } = useNetworkStatus()
</script>
