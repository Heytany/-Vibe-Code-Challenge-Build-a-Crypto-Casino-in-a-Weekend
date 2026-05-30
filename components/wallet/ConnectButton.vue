<template>
  <button
    type="button"
    class="bw-btn bw-broken-tilt"
    :disabled="connecting"
    @click="onClick"
  >
    <span v-if="connected && publicKey">
      {{ truncatedAddress }}
    </span>
    <span v-else-if="connecting">
      {{ t('wallet.connecting') }}
    </span>
    <span v-else>
      {{ t('wallet.connect') }}
    </span>
  </button>
</template>

<script setup lang="ts">
/**
 * @agent-context Phantom connect button — delegates to useWallet composable.
 * @see composables/useWallet.ts
 */
const { t } = useI18n()
const { connected, connecting, publicKey, connect, disconnect } = useWallet()

const truncatedAddress = computed(() => {
  if (!publicKey.value) return ''
  const s = publicKey.value
  return `${s.slice(0, 4)}…${s.slice(-4)}`
})

async function onClick() {
  try {
    if (connected.value) {
      await disconnect()
    } else {
      await connect()
    }
  } catch (error) {
    useBrutalToast().showError(error)
  }
}
</script>
