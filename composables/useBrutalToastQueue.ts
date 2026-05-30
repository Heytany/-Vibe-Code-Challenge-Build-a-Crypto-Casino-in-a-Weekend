/**
 * @agent-context Internal toast queue — use useBrutalToast() in pages/composables, not this directly.
 */
export type BrutalToastVariant = 'default' | 'error' | 'success'

export interface BrutalToastItem {
  id: string
  title: string
  description?: string
  variant: BrutalToastVariant
  open: boolean
}

export function useBrutalToastQueue() {
  const toasts = useState<BrutalToastItem[]>('brutal-toast-queue', () => [])

  function removeToast(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function pushToast(
    title: string,
    description?: string,
    variant: BrutalToastVariant = 'default',
  ) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    toasts.value.push({ id, title, description, variant, open: true })
  }

  return { toasts, pushToast, removeToast }
}
