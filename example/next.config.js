const { getMulConfig } = require('next-multilingual/config');

module.exports = getMulConfig('exampleApp', ['en-US', 'fr-CA'], {
  poweredByHeader: false
});
