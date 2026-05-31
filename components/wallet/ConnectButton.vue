<template>
  <button
    type="button"
    class="bw-btn bw-broken-tilt"
    :disabled="connecting || motionStore.isLocked"
    @click="onClick"
  >
    <span v-if="connected && publicKey">
      {{ truncatedAddress }}
    </span>
    <UiLocaleText v-else-if="connecting" path="wallet.connecting" />
    <UiLocaleText v-else path="wallet.connect" />
  </button>
</template>

<script setup lang="ts">
/**
 * @agent-context Phantom connect — crack modal on connect, plain disconnect.
 * @see composables/useBrutalMotion.ts playCrackModal
 */
const { connected, connecting, publicKey, connect, disconnect } = useWallet()
const { playCrackModal } = useBrutalMotion()
const motionStore = useMotionStore()
const { showError } = useBrutalToast()

const truncatedAddress = computed(() => {
  if (!publicKey.value) return ''
  const s = publicKey.value
  return `${s.slice(0, 4)}…${s.slice(-4)}`
})

async function onClick() {
  try {
    if (connected.value) {
      await disconnect()
      return
    }
    await playCrackModal({
      connect: async () => {
        await connect()
      },
    })
  } catch (error) {
    showError(error)
  }
}
</script>
