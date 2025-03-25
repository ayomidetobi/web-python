
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['/assets/css/global.css'],
  runtimeConfig: {
    //this is a test
    API_KEY: process.env.NUXT_INDUCTIVA_API_KEY,
    public: {
      apiKey: process.env.NUXT_INDUCTIVA_API_KEY,
    },
  },
  app: {
    head: {
      title: 'Python Playground',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'In-browser Python playground built with Nuxt, PrismJS, and Pyodide' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
      
    }
  },
})
