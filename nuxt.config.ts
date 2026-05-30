// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,

  // Fix: Nuxt 3.21.3+ breaks dev with ssr:false (Vite Node IPC socket)
  // https://github.com/nuxt/nuxt/issues/35114
  experimental: {
    viteEnvironmentApi: true,
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    'reka-ui/nuxt',
  ],

  css: ['~/assets/css/brutalism.css'],

  i18n: {
    bundle: {
      optimizeTranslationDirective: false,
    },
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ru', name: 'Русский', file: 'ru.json' },
      { code: 'uk', name: 'Українська', file: 'uk.json' },
    ],
    defaultLocale: 'en',
    lazy: true,
    langDir: 'locales',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'wibe_locale',
      fallbackLocale: 'en',
    },
  },

  app: {
    head: {
      title: 'Brutal wibe',
      meta: [
        {
          name: 'description',
          content: 'Brutal wibe — a broken brutalist on-chain crypto casino on Solana devnet.',
        },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap',
        },
      ],
    },
  },

  // Nuxt auto-maps NUXT_PUBLIC_* from .env — do not use process.env here
  runtimeConfig: {
    public: {
      solanaNetwork: '',
      solanaRpcUrl: '',
      casinoProgramId: '',
      casinoTokenMint: '',
    },
  },
})
