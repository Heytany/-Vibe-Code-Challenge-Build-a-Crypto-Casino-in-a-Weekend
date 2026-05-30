/**
 * @agent-context Apply persisted theme before paint (cookie synced with inline head script).
 */
export default defineNuxtPlugin(() => {
  useThemeStore().init()
})
