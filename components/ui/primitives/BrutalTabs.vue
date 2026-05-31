<template>
  <TabsRoot v-model="model" class="bw-tabs">
    <TabsList class="bw-dice-tabs" :aria-label="ariaLabel">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="bw-dice-tabs__btn"
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
    <div class="bw-game-tabpanels">
      <TabsContent
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="bw-game-tabpanel"
      >
        <slot :name="tab.value" />
      </TabsContent>
    </div>
  </TabsRoot>
</template>

<script setup lang="ts">
/**
 * @agent-context Brutalist wrapper over Reka UI Tabs — keyboard arrows / Home-End / aria for free,
 * styled with our tokens. Replaces the hand-rolled role=tablist buttons in the games.
 * @see ai/specs/ui-primitives.md
 */
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'

defineProps<{
  tabs: { value: string; label: string }[]
  ariaLabel?: string
}>()

const model = defineModel<string>({ required: true })
</script>
