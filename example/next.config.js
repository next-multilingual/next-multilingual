const IntlRouter = require('next-intl-router').default;

const locales = ['en-CA', 'fr-CA', 'catchAll'];
const intlRouter = new IntlRouter(
  'pages',
  locales.filter((l) => l !== 'catchAll')
);

module.exports = {
  i18n: {
    locales,
    defaultLocale: 'catchAll'
  },
  // basePath: '/folder',
  publicRuntimeConfig: {
    origin: process.env.NEXT_PUBLIC_DOMAIN_URL
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
    return [
      {
        source: '/catchAll',
        destination: '/en-CA',
        locale: false,
        permanent: false
      },
      {
        source: '/catchAll/:slug*',
        destination: '/en-CA/:slug*',
        locale: false,
        permanent: false
      },
      ...redirects
    ];
  }
};
