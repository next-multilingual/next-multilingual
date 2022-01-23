import { KeyValueObject, parsePropertiesFile } from '../../src/messages/properties';

const pluginConfig: Cypress.PluginConfig = (on) => {
  on('task', {
    /**
     * Task to log a message on the console whe running in headless mode.
     *
     * @param message - The message to display on the console.
     */
    log(message: string): void {
      console.log(message);
      return;
    },
    /**
     * Get messages from a .properties file.
     *
     * @param filePath - A .properties file path.
     *
     * @returns The key/value object containing the messages, where the key is the message identifier.
     */
    getMessages(filePath: string): KeyValueObject {
      const keyValueObject = parsePropertiesFile(filePath);
      const messages = {};

      for (const [key, value] of Object.entries(keyValueObject)) {
        messages[key.split('.').pop()] = value;
      }
      return messages;
    },
  });
};

export default pluginConfig;
