const { getMulConfig } = require('next-multilingual/config');
module.exports = getMulConfig(['en-US', 'fr-CA'], { poweredByHeader: false });
