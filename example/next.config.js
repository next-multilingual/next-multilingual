const { getConfig } = require('next-multilingual/config');

module.exports = getConfig('exampleApp', ['en-US', 'fr-CA'], {
  poweredByHeader: false
});
