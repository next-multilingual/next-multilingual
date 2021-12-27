// This plugin allows to log to the console when running headless.
const pluginConfig: Cypress.PluginConfig = (on) => {
  on('task', {
    log(message) {
      console.log(message);
      return null;
    },
  });
};

export default pluginConfig;
