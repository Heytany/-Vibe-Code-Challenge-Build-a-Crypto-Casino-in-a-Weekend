<template>
  <ToastProvider :duration="4000">
    <slot />
    <UiPrimitivesBrutalToast
      v-for="toast in toasts"
      :key="toast.id"
      v-model:open="toast.open"
      :title="toast.title"
      :description="toast.description"
      :variant="toast.variant"
      @update:open="(v) => !v && removeToast(toast.id)"
    />
    <ToastViewport class="bw-toast-viewport" />
  </ToastProvider>
</template>

<script setup lang="ts">
/**
 * @agent-context Mount once in app.vue — provides toast viewport for useBrutalToast().
 * @see composables/useBrutalToast.ts
 */
import { ToastProvider, ToastViewport } from 'reka-ui'

const { toasts, removeToast } = useBrutalToastQueue()
</script>
