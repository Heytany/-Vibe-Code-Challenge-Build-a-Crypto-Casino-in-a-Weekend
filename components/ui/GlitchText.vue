<template>
  <component
    :is="tag"
    class="inline-block"
    :class="{ 'bw-glitch': glitching }"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
/**
 * @agent-context Glitch text wrapper — triggers animation on demand.
 * @see ai/specs/ui-brutalism.md
 */
withDefaults(
  defineProps<{
    tag?: string
    glitching?: boolean
  }>(),
  { tag: 'span', glitching: false },
)
</script>
