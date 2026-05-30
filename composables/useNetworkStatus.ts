/**
 * @agent-context Online/offline — banner in shell + one toast when connection drops.
 */
export function useNetworkStatus() {
  const online = ref(true)
  const { t } = useI18n()
  const { show } = useBrutalToast()

  function syncOnline() {
    if (import.meta.client) online.value = navigator.onLine
  }

  if (import.meta.client) {
    onMounted(() => {
      syncOnline()
      window.addEventListener('online', syncOnline)
      window.addEventListener('offline', syncOnline)
    })

    onUnmounted(() => {
      window.removeEventListener('online', syncOnline)
      window.removeEventListener('offline', syncOnline)
    })

    watch(online, (isOnline, wasOnline) => {
      if (!isOnline && wasOnline) {
        show(t('errors.offline.toast'), t('errors.offline.banner'), 'error')
      }
    })
  }

  return { online: readonly(online) }
}
