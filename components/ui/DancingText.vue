<template>
  <component :is="tag" class="bw-dancing-text" :class="className">
    <template v-for="(word, wi) in words" :key="wi"><span class="bw-dancing-text__word"><span
          v-for="c in word"
          :key="c.i"
          class="bw-dancing-text__char"
          :style="{ '--bw-dance-i': c.i }"
        >{{ c.ch }}</span></span>{{ wi < words.length - 1 ? ' ' : '' }}</template>
  </component>
</template>

<script setup lang="ts">
/**
 * @agent-context Per-letter dance animation — access denied hero, glitch headings.
 * Letters are grouped into words (inline-block, nowrap) so multi-word text wraps ONLY at spaces
 * (e.g. "ACCESS DENIED" → two whole words on mobile), never mid-word.
 */
const props = withDefaults(
  defineProps<{
    text: string
    tag?: string
    className?: string
  }>(),
  { tag: 'p', className: '' },
)

const words = computed(() => {
  let i = 0
  return props.text.split(' ').map((word) =>
    Array.from(word).map((ch) => ({ ch, i: i++ })),
  )
})
</script>

<style scoped>
.bw-dancing-text__word {
  display: inline-block;
  white-space: nowrap;
}
</style>
