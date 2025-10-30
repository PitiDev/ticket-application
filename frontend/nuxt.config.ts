export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],
  css: ['~/assets/css/lao-font.css',
  ],
  tailwindcss: {
    config: {
      darkMode: 'class', // Enable class-based dark mode
    }
  },
  runtimeConfig: {
    public: {
      apiBase: 'https://ticket.laobullionbank.com/api' //https://ticket.laobullionbank.com/api
    }
  },

  app: {
    head: {
      title: 'Ticket System',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  compatibilityDate: '2025-02-17'
})