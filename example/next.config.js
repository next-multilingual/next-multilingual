const IntlRouter = require('next-intl-router').default;

const locales = ['en-CA', 'fr-CA'];
const intlRouter = new IntlRouter('pages', locales);

module.exports = {
  reactStrictMode: true,
  i18n: {
    locales,
    defaultLocale: 'en-CA',
    localeDetection: false
  },
  poweredByHeader: false,
  webpack(config, { dev, isServer }) {
    if (isServer && !dev)
      config.resolve.alias['next-intl-router/lib/link$'] = require.resolve(
        'next-intl-router/lib/ssr-link'
      );
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
