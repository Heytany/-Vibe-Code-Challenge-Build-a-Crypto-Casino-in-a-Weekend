<template>
  <ToastProvider :duration="4000">
    <slot />
    <Teleport to="body">
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
    </Teleport>
  </ToastProvider>
</template>

<script setup lang="ts">
/**
 * @agent-context Mount once in app.vue — toast viewport teleported to body (viewport-fixed, not app bottom).
 * @see composables/useBrutalToast.ts
 */
import { ToastProvider, ToastViewport } from 'reka-ui'

const { toasts, removeToast } = useBrutalToastQueue()
</script>
