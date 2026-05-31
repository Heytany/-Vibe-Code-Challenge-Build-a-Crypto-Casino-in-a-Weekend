// https://nuxt.com/docs/api/configuration/nuxt-config
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,

  // Fix: Nuxt 3.21.3+ breaks dev with ssr:false (Vite Node IPC socket)
  // https://github.com/nuxt/nuxt/issues/35114
  experimental: {
    viteEnvironmentApi: true,
    // Silence dev-only "#app-manifest" pre-transform noise (Nuxt 3.21 + Vite 7)
    appManifest: false,
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
      title: 'Brutal wibe — broken on-chain casino',
      htmlAttrs: { lang: 'en' },
      meta: [
        {
          name: 'description',
          content:
            'Brutal wibe — a corrupted brutalist on-chain crypto casino on Solana devnet. Deposit devnet tokens, play Glitch Roll & Corrupted Reels, verify every roll on Solana Explorer.',
        },
        { name: 'theme-color', content: '#0a0a0a' },
        { name: 'keywords', content: 'Solana, devnet, casino, on-chain, crypto, dice, slot, brutalist, web3, Phantom' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Brutal wibe' },
        { property: 'og:title', content: 'Brutal wibe — broken on-chain casino' },
        {
          property: 'og:description',
          content:
            'A corrupted on-chain casino on Solana devnet. Deposit devnet tokens, play broken games, verify every roll on Solana Explorer.',
        },
        { property: 'og:image', content: '/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Brutal wibe — pixel-art monster holding two glitch games' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Brutal wibe — broken on-chain casino' },
        {
          name: 'twitter:description',
          content: 'A corrupted on-chain casino on Solana devnet. Verify every roll on Solana Explorer.',
        },
        { name: 'twitter:image', content: '/og-image.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap',
        },
      ],
      script: [
        {
          key: 'bw-theme-init',
          innerHTML: `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)wibe_theme=([^;]*)/);var t=m&&decodeURIComponent(m[1])==='day'?'day':'night';document.documentElement.setAttribute('data-bw-theme',t)}catch(e){document.documentElement.setAttribute('data-bw-theme','night')}})();`,
          tagPosition: 'head',
        },
      ],
    },
  },

  nitro: {
    preset: 'static',
  },

  build: {
    transpile: ['@coral-xyz/anchor', '@solana/spl-token'],
  },

  vite: {
    plugins: [
      nodePolyfills({
        include: ['buffer', 'process'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
    ],
    resolve: {
      alias: {
        buffer: 'buffer/',
      },
    },
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['buffer', '@solana/spl-token', '@coral-xyz/anchor'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
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
