<template>
  <div class="bw-wallet-connect">
    <button
      type="button"
      class="bw-btn bw-broken-tilt w-full sm:w-auto"
      :class="{ 'bw-btn--wallet-connected': connected && publicKey }"
      :disabled="connecting || motionStore.isLocked"
      @click="onClick"
    >
      <span v-if="connected && publicKey" class="bw-wallet-label">
        <span class="bw-wallet-label__addr">{{ truncatedAddress }}</span>
        <span class="bw-wallet-label__hint">
          <UiLocaleText path="wallet.disconnectHint" tag="span" />
        </span>
      </span>
      <UiLocaleText v-else-if="connecting" path="wallet.connecting" />
      <UiLocaleText v-else path="wallet.connect" />
    </button>

    <UiPrimitivesBrutalAlert
      v-model:open="disconnectOpen"
      :title="t('wallet.disconnectConfirm.title')"
      :description="t('wallet.disconnectConfirm.description')"
      :cancel-label="t('wallet.disconnectConfirm.cancel')"
      :action-label="t('wallet.disconnectConfirm.confirm')"
      @action="onDisconnectConfirm"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Phantom connect — crack modal on connect; disconnect needs confirm dialog.
 * @see composables/useBrutalMotion.ts playCrackModal
 */
const { t } = useI18n()
const { connected, connecting, publicKey, connect, disconnect } = useWallet()
const { playCrackModal } = useBrutalMotion()
const motionStore = useMotionStore()
const { showError } = useBrutalToast()

const disconnectOpen = ref(false)

const truncatedAddress = computed(() => {
  if (!publicKey.value) return ''
  const s = publicKey.value
  return `${s.slice(0, 4)}…${s.slice(-4)}`
})

function openDisconnectConfirm() {
  if (motionStore.crackOpen) {
    motionStore.finishCrack()
  }
  disconnectOpen.value = true
}

async function onClick() {
  try {
    if (connected.value) {
      openDisconnectConfirm()
      return
    }
    if (motionStore.crackOpen) return
    await playCrackModal({
      connect: async () => {
        await connect()
      },
    })
  } catch (error) {
    showError(error)
  }
}

async function onDisconnectConfirm() {
  try {
    await disconnect()
  } catch (error) {
    showError(error)
  }
}
</script>

<style scoped>
.bw-wallet-connect {
  width: 100%;
  min-width: 0;
}

@media (min-width: 640px) {
  .bw-wallet-connect {
    width: auto;
  }
}
</style>
