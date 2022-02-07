const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const { getConfig } = require('next-multilingual/config');

const config = getConfig('exampleApp', ['en-US', 'fr-CA'], {
  reactStrictMode: true,
  poweredByHeader: false,
  // debug: true,
});

module.exports = withBundleAnalyzer(config);
