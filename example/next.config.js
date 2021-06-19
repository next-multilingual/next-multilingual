const { MulRouter } = require('next-multilingual/router');

// The `mul` (multilingual) default locale is required for dynamic locale resolution for requests on `/`.
const locales = ['mul', 'en-US', 'fr-CA'];
const mulRouter = new MulRouter(locales);

module.exports = {
  i18n: {
    locales: mulRouter.getUrlLocalePrefixes(),
    defaultLocale: mulRouter.getDefaultUrlLocalePrefix(),
    localeDetection: false
  },
  publicRuntimeConfig: {
    origin: 'http://localhost:3000'
  },
  poweredByHeader: false,
  webpack(config, { isServer }) {
    // console.dir(config, { depth: null });
    if (isServer) {
      console.dir(config.resolve.alias);
      config.resolve.alias['next-multilingual/link$'] = require.resolve(
        'next-multilingual/link-ssr'
      );
      console.dir(config.resolve.alias);
    }

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
    const rewrites = mulRouter.getRewrites();
    // console.dir('rewrites');
    // console.dir({ rewrites }, { depth: null });
    return rewrites;
  },
  async redirects() {
    const redirects = mulRouter.getRedirects();
    // console.dir('redirects');
    // console.dir({ redirects }, { depth: null });
    return redirects;
  }
};
