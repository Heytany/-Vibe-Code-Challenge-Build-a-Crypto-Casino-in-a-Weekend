/**
 * @agent-context Phantom wallet connection — single entry for all wallet operations.
 * @depends window.phantom?.solana (Phantom extension)
 * @see ai/AGENT_ONBOARDING.md
 * @failure-modes: No extension → WALLET_NOT_CONNECTED; user reject → WALLET_REJECTED
 */
import { Connection, PublicKey } from '@solana/web3.js'
import { WibeError, WibeErrorCode } from '~/shared/errors'

interface PhantomProvider {
  isPhantom?: boolean
  publicKey: PublicKey | null
  connect: () => Promise<{ publicKey: PublicKey }>
  disconnect: () => Promise<void>
  on: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void
}

function getPhantom(): PhantomProvider | null {
  if (import.meta.server) return null
  const provider = (window as unknown as { phantom?: { solana?: PhantomProvider } }).phantom?.solana
  return provider?.isPhantom ? provider : null
}

const connected = ref(false)
const connecting = ref(false)
const publicKey = ref<string | null>(null)

export function useWallet() {
  const config = useRuntimeConfig()

  const connection = computed(() => {
    const url = config.public.solanaRpcUrl as string
    if (!url) return null
    return new Connection(url, 'confirmed')
  })

  async function connect() {
    const phantom = getPhantom()
    if (!phantom) {
      throw new WibeError(WibeErrorCode.WalletNotConnected, 'Install Phantom wallet extension.')
    }

    connecting.value = true
    try {
      const resp = await phantom.connect()
      publicKey.value = resp.publicKey.toBase58()
      connected.value = true
    } catch {
      throw new WibeError(WibeErrorCode.WalletRejected)
    } finally {
      connecting.value = false
    }
  }

  async function disconnect() {
    const phantom = getPhantom()
    if (phantom) {
      await phantom.disconnect()
    }
    connected.value = false
    publicKey.value = null
  }

  function syncFromPhantom() {
    const phantom = getPhantom()
    if (phantom?.publicKey) {
      publicKey.value = phantom.publicKey.toBase58()
      connected.value = true
    }
  }

  onMounted(() => {
    syncFromPhantom()
    const phantom = getPhantom()
    if (phantom) {
      const handler = () => syncFromPhantom()
      phantom.on('connect', handler)
      phantom.on('disconnect', () => {
        connected.value = false
        publicKey.value = null
      })
    }
  })

  return {
    connected: readonly(connected),
    connecting: readonly(connecting),
    publicKey: readonly(publicKey),
    connection,
    connect,
    disconnect,
  }
}
