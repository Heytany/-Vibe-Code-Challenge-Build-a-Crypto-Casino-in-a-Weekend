<template>
  <ToastRoot
    v-model:open="open"
    class="bw-panel bw-panel--broken p-4 grid gap-1 data-[state=open]:animate-in data-[state=closed]:animate-out"
    :class="variantClass"
  >
    <ToastTitle class="font-bold uppercase text-sm tracking-wide">
      {{ title }}
    </ToastTitle>
    <ToastDescription v-if="description" class="text-sm whitespace-normal opacity-90">
      {{ description }}
    </ToastDescription>
    <ToastClose class="absolute top-2 right-2 bw-btn text-xs py-1 px-2 min-h-[44px] min-w-[44px]">
      ✕
    </ToastClose>
  </ToastRoot>
</template>

<script setup lang="ts">
/**
 * @agent-context Styled toast item — used internally by useBrutalToast, not directly in pages.
 */
import { ToastClose, ToastDescription, ToastRoot, ToastTitle } from 'reka-ui'

const props = defineProps<{
  title: string
  description?: string
  variant?: 'default' | 'error' | 'success'
}>()

const open = defineModel<boolean>('open', { default: true })

const variantClass = computed(() => {
  if (props.variant === 'error') return 'border-[var(--bw-danger)] shadow-[4px_4px_0_var(--bw-danger)]'
  if (props.variant === 'success') return 'border-[var(--bw-accent)]'
  return ''
})
</script>
