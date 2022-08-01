import { defineConfig } from 'cypress'
import { KeyValueObject, parsePropertiesFile } from './src/messages/properties'

export default defineConfig({
  env: {
    prodBaseUrl: 'https://next-multilingual-example.vercel.app',
  },
  video: false,
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        /**
         * Task to log a message on the console whe running in headless mode.
         *
         * @param message - The message to display on the console.
         */
        log(message: string): null {
          console.log(message)
          return null
        },
        /**
         * Get messages from a .properties file.
         *
         * @param filePath - A .properties file path.
         *
         * @returns The key/value object containing the messages, where the key is the message identifier.
         */
        getMessages(filePath: string): KeyValueObject {
          const keyValueObject = parsePropertiesFile(filePath)
          const messages = {}

          for (const [key, value] of Object.entries(keyValueObject)) {
            const compactedKey = key.split('.').pop()
            if (compactedKey !== undefined) {
              messages[compactedKey] = value
            }
          }
          return messages
        },
      })
    },
    baseUrl: 'http://localhost:3000',
  },
})
