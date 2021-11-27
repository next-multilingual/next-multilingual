const { getConfig } = require('next-multilingual/config');

const config = getConfig('exampleApp', ['en-US', 'fr-CA'], {
  poweredByHeader: false
});

module.exports = config;
