const IntlRouter = require('next-intl-router').default;

const locales = ['en-CA', 'fr-CA'];
const intlRouter = new IntlRouter('pages', locales);

module.exports = {
  i18n: {
    locales,
    defaultLocale: 'en-CA',
    localeDetection: false
  },
  publicRuntimeConfig: {
    origin: 'http://localhost:3000'
  },
  poweredByHeader: false,
  webpack(config, { dev, isServer }) {
    if (isServer && !dev)
      config.resolve.alias['next-intl-router/lib/link$'] = require.resolve(
        'next-intl-router/lib/ssr-link'
      );
    config.module.rules.push({
      test: /\.properties$/,
      loader: 'messageformat-properties-loader',
      options: {
        keyPath: true
      }
    });
    console.warn('config', config.module);
    return config;
  },
  async rewrites() {
    const rewrites = await intlRouter.getRewrites();
    //console.dir({ rewrites }, { depth: null });
    return rewrites;
  },
  async redirects() {
    const redirects = await intlRouter.getRedirects();
    //console.dir({ redirects }, { depth: null });
    return redirects;
  }
};
