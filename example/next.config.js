const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const { getConfig } = require('next-multilingual/config');

const config = getConfig('exampleApp', ['en-US', 'fr-CA'], {
  reactStrictMode: true,
  poweredByHeader: false,
  // basePath: '/some-path',
  // debug: true,
});

// Set base path dynamically.
if (process.env.BASE_PATH) {
  config.basePath = process.env.BASE_PATH;
}

module.exports = withBundleAnalyzer(config);
