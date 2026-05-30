<template>
  <component :is="tag" class="bw-dancing-text" :class="className">
    <span
      v-for="(char, index) in chars"
      :key="`${index}-${char}`"
      class="bw-dancing-text__char"
      :style="{ '--bw-dance-i': index }"
      :aria-hidden="char === ' ' ? true : undefined"
    >{{ char === ' ' ? '\u00a0' : char }}</span>
  </component>
</template>

<script setup lang="ts">
/**
 * @agent-context Per-letter dance animation — access denied hero, glitch headings.
 */
const props = withDefaults(
  defineProps<{
    text: string
    tag?: string
    className?: string
  }>(),
  { tag: 'p', className: '' },
)

const chars = computed(() => Array.from(props.text))
</script>
