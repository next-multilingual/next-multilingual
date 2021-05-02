const IntlRouter = require('next-intl-router').default;
const {
  getActualLocales
} = require('next-intl-router/lib/helpers/getLocalesDetails');

// This required for dynamic locale resolution for requests on `/`.
const defaultLocale = 'mul';
// The (real) default locale used by `getLocalesDetails` will be the first non-default locale in the configuration.
const locales = [defaultLocale, 'en-CA', 'fr-CA'];
const actualLocales = getActualLocales(locales, defaultLocale);
const intlRouter = new IntlRouter('pages', actualLocales);

module.exports = {
  i18n: {
    locales,
    defaultLocale,
    localeDetection: false
  },
  future: { webpack5: true },
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
      loader: 'properties-json-loader',
      options: {
        namespaces: false
      }
    });
    return config;
  },
  async rewrites() {
    const rewrites = await intlRouter.getRewrites();
    // console.dir('rewrites');
    // console.dir({ rewrites }, { depth: null });
    return rewrites;
  },
  async redirects() {
    const redirects = await intlRouter.getRedirects();
    // console.dir('redirects');
    // console.dir({ redirects }, { depth: null });
    return redirects;
  }
};
