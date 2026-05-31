/**
 * @agent-context Fullscreen game mode. Fullscreens the document root (not a child) so that
 * body-teleported win toasts stay visible, and toggles `bw-fullscreen-game` on <html> so the
 * header/footer can hide for an immersive play surface.
 * @see components/games/GameAutoFsBar.vue, ai/decisions/016-game-automation-fullscreen.md
 */
export function useFullscreen() {
  const isFullscreen = ref(false)

  function sync() {
    isFullscreen.value = Boolean(document.fullscreenElement)
    document.documentElement.classList.toggle('bw-fullscreen-game', isFullscreen.value)
  }

  async function enter() {
    try {
      await document.documentElement.requestFullscreen?.()
    } catch {
      /* user gesture / unsupported — ignore, stay windowed */
    }
  }

  async function exit() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen?.()
    } catch {
      /* ignore */
    }
  }

  async function toggle() {
    if (document.fullscreenElement) await exit()
    else await enter()
  }

  onMounted(() => document.addEventListener('fullscreenchange', sync))
  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', sync)
    document.documentElement.classList.remove('bw-fullscreen-game')
  })

  return { isFullscreen, enter, exit, toggle }
}
