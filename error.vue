<template>
  <MotionAccessDeniedScreen :status-code="statusCode" @exit="goLobby" />
</template>

<script setup lang="ts">
/**
 * @agent-context Nuxt error boundary — one brutal design for 404, runtime, access errors.
 */
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => props.error.statusCode ?? 500)

function goLobby() {
  clearError({ redirect: '/' })
}
</script>
