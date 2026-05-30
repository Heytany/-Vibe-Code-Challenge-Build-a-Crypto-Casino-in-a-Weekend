<template>
  <ConfigProvider :use-id="useIdFn">
    <UiPrimitivesBrutalToastHost>
      <div class="min-h-screen flex flex-col">
        <LayoutAppHeader />
        <main class="flex-1 container mx-auto px-4 py-8 max-w-5xl">
          <NuxtPage />
        </main>
        <LayoutFooterFootnotes />
      </div>
    </UiPrimitivesBrutalToastHost>
  </ConfigProvider>
</template>

<script setup lang="ts">
/**
 * @agent-context Root layout — ConfigProvider for Reka UI IDs, BrutalToastHost for toasts.
 * @see ai/specs/ui-primitives.md, ai/decisions/009-reka-ui-headless.md
 */
import { ConfigProvider } from 'reka-ui'

const useIdFn = () => useId()
</script>
