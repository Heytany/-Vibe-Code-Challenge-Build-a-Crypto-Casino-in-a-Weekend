<template>
  <AccordionRoot
    type="single"
    collapsible
    class="space-y-2"
    :default-value="defaultOpen"
  >
    <AccordionItem
      v-for="item in items"
      :key="item.value"
      :value="item.value"
      class="bw-panel overflow-hidden"
    >
      <AccordionHeader>
        <AccordionTrigger
          class="flex w-full min-h-[44px] items-center justify-between gap-2 p-4 font-bold uppercase text-left hover:bg-[var(--bw-accent)] hover:text-[var(--bw-bg)] transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-[var(--bw-accent)]"
        >
          <span class="whitespace-normal bw-locale-text">{{ item.title }}</span>
          <span class="text-[var(--bw-accent)] shrink-0" aria-hidden="true">+</span>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent
        class="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      >
        <div class="px-4 pb-4 text-sm whitespace-normal text-[var(--bw-muted)] bw-locale-text">
          {{ item.content }}
        </div>
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>

<script setup lang="ts">
/**
 * @agent-context Brutalist accordion for footnotes, FAQ, game rules lists.
 * @see ai/specs/ui-primitives.md — prefer this over hand-rolling expand/collapse.
 */
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from 'reka-ui'

export interface BrutalAccordionItem {
  value: string
  title: string
  content: string
}

defineProps<{
  items: BrutalAccordionItem[]
  defaultOpen?: string
}>()
</script>

<style scoped>
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--reka-accordion-content-height); }
}
@keyframes accordion-up {
  from { height: var(--reka-accordion-content-height); }
  to { height: 0; }
}
.animate-accordion-down {
  animation: accordion-down 0.2s ease-out;
}
.animate-accordion-up {
  animation: accordion-up 0.2s ease-out;
}
</style>
