/**
 * @agent-context Motion layer state — overlays, locks, transition targets.
 * @see composables/useBrutalMotion.ts
 */
export type MotionOverlay = 'matrix' | 'crack' | null
export type CrackPhase = 'idle' | 'opening' | 'connecting' | 'success' | 'error' | 'closing'

export const useMotionStore = defineStore('motion', () => {
  const isLocked = ref(false)
  const activeOverlay = ref<MotionOverlay>(null)

  const matrixTarget = ref<string | null>(null)
  let matrixComplete: (() => void) | null = null
  let lockFailsafeTimer: ReturnType<typeof setTimeout> | null = null

  const crackOpen = ref(false)
  const crackPhase = ref<CrackPhase>('idle')
  const crackMessage = ref('')
  let crackConnectFn: (() => Promise<void>) | null = null
  let crackComplete: (() => void) | null = null

  function lockMotion() {
    isLocked.value = true
    if (import.meta.client) {
      document.body.classList.add('bw-motion-lock')
    }
    clearLockFailsafe()
    lockFailsafeTimer = setTimeout(() => {
      unlockMotion()
    }, 3000)
  }

  function unlockMotion() {
    isLocked.value = false
    activeOverlay.value = null
    if (import.meta.client) {
      document.body.classList.remove('bw-motion-lock')
    }
    clearLockFailsafe()
  }

  function clearLockFailsafe() {
    if (lockFailsafeTimer) {
      clearTimeout(lockFailsafeTimer)
      lockFailsafeTimer = null
    }
  }

  function startMatrix(to: string): Promise<void> {
    return new Promise((resolve) => {
      matrixTarget.value = to
      matrixComplete = resolve
      activeOverlay.value = 'matrix'
      lockMotion()
    })
  }

  function finishMatrix(navigate: (to: string) => void) {
    const target = matrixTarget.value
    matrixTarget.value = null
    matrixComplete?.()
    matrixComplete = null
    unlockMotion()
    if (target) {
      navigate(target)
    }
  }

  function cancelMatrix() {
    const target = matrixTarget.value
    matrixTarget.value = null
    matrixComplete?.()
    matrixComplete = null
    unlockMotion()
    return target
  }

  function startCrack(connectFn: () => Promise<void>): Promise<void> {
    return new Promise((resolve) => {
      crackConnectFn = connectFn
      crackComplete = resolve
      crackPhase.value = 'opening'
      crackOpen.value = true
      activeOverlay.value = 'crack'
      lockMotion()
    })
  }

  function setCrackPhase(phase: CrackPhase, message = '') {
    crackPhase.value = phase
    crackMessage.value = message
  }

  async function runCrackConnect() {
    if (!crackConnectFn) return
    setCrackPhase('connecting')
    try {
      await crackConnectFn()
      setCrackPhase('success')
    } catch {
      setCrackPhase('error')
    }
  }

  function finishCrack() {
    crackOpen.value = false
    crackPhase.value = 'idle'
    crackMessage.value = ''
    crackConnectFn = null
    crackComplete?.()
    crackComplete = null
    unlockMotion()
  }

  return {
    isLocked,
    activeOverlay,
    matrixTarget,
    crackOpen,
    crackPhase,
    crackMessage,
    lockMotion,
    unlockMotion,
    startMatrix,
    finishMatrix,
    cancelMatrix,
    startCrack,
    setCrackPhase,
    runCrackConnect,
    finishCrack,
  }
})
