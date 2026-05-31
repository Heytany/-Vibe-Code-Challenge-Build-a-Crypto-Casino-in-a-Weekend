<template>
  <ConfigProvider :use-id="useIdFn">
    <UiPrimitivesBrutalToastHost>
      <MotionRoot />
      <NuxtLoadingIndicator color="var(--bw-accent)" :height="3" :duration="2200" />
      <LayoutOfflineBanner />
      <div class="min-h-screen flex flex-col">
        <LayoutAppHeader />
        <LayoutWalletStrip />
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
 * @agent-context Root layout — MotionRoot for GSAP overlays, ConfigProvider for Reka UI.
 * @see ai/specs/ui-motion.md
 */
import { ConfigProvider } from 'reka-ui'
import MotionRoot from '~/components/motion/MotionRoot.vue'

const useIdFn = () => useId()
</script>
