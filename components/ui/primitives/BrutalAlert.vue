<template>
  <AlertDialogRoot :open="open" @update:open="emit('update:open', $event)">
    <AlertDialogPortal>
      <AlertDialogOverlay class="fixed inset-0 bg-black/80 z-[200]" />
      <AlertDialogContent
        class="fixed left-1/2 top-1/2 z-[201] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 bw-panel bw-panel--broken p-6 focus:outline-none"
      >
        <AlertDialogTitle class="text-lg font-bold uppercase mb-2 bw-accent">
          {{ title }}
        </AlertDialogTitle>
        <AlertDialogDescription class="text-sm whitespace-normal mb-6 text-[var(--bw-muted)]">
          {{ description }}
        </AlertDialogDescription>
        <div class="flex flex-wrap gap-3 justify-end">
          <AlertDialogCancel as-child>
            <UiBrutalButton :broken="false">
              {{ cancelLabel }}
            </UiBrutalButton>
          </AlertDialogCancel>
          <AlertDialogAction v-if="actionLabel" as-child>
            <UiBrutalButton variant="accent" @click="emit('action')">
              {{ actionLabel }}
            </UiBrutalButton>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>

<script setup lang="ts">
/**
 * @agent-context Brutalist error/confirm dialog — use for blocking errors (env, tx fail).
 * @example <UiPrimitivesBrutalAlert v-model:open="show" :title="..." :description="..." />
 * @see ai/specs/ui-primitives.md
 */
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
} from 'reka-ui'

withDefaults(
  defineProps<{
    title: string
    description: string
    cancelLabel?: string
    actionLabel?: string
  }>(),
  {
    cancelLabel: 'OK',
    actionLabel: undefined,
  },
)

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ action: [] }>()
</script>
