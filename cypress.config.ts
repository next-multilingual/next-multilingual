import { defineConfig } from 'cypress'

export default defineConfig({
  env: {
    prodBaseUrl: 'https://next-multilingual-example.vercel.app',
  },
  video: false,
  screenshotOnRunFailure: false,
  e2e: {
    // Test isolation is enabled by default since Cypress 12 - on our side it would slow down the tests so we disable it.
    testIsolation: false,
    setupNodeEvents: (on) => {
      on('task', {
        /**
         * Task to log a message on the console whe running in headless mode.
         *
         * @param message - The message to display on the console.
         *
         * @returns `true` because Cypress tasks must always return a value to indicate that the task was handled.
         */
        log: (message: string): true => {
          console.log(message)
          return true
        },
      })
    },
    baseUrl: 'http://localhost:3000',
  },
})
