import { defineConfig } from 'cypress';

export default defineConfig({
  env: {
    prodBaseUrl: 'https://next-multilingual-example.vercel.app',
  },
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.ts').default(on, config);
    },
    baseUrl: 'http://localhost:3000',
  },
});
