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
    <ToastViewport
      class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm p-0 outline-none"
    />
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
