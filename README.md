# next-intl-router

Locale-specific Unicode routes for Next.js

## Usage

Add the package as a dependency:

```
npm install --save-dev next-intl-router
```

Then add the following to your `next.config.js` file:

```js
const IntlRouter = require('next-intl-router').default;

const locales = ['en', 'fr'];
const intlRouter = new IntlRouter('pages', locales);

module.exports = {
  i18n: { locales, defaultLocale: 'en' },
  async rewrites() {
    const rewrites = await intlRouter.getRewrites();
    return rewrites;
  },
  async redirects() {
    const redirects = await intlRouter.getRedirects();
    return redirects;
  }
};
```

By itself, this won't change anything.
You'll also need to add `.properties` files next to each page for which you wish to provide an internationalised route, named as `PAGE.LOCALE.properties`, and these must have a `title` value.
For example:

```properties
# contact-us.fr.properties
title = Nous joindre

messageLabel = Message
submitButton = Envoyer
```

Once such are provided, visitors to `/fr/contact-us` will be automatically redirected to `/fr/nous-joindre`, along with support for all Unicode normalisations in page paths.

### IntlRouter

```js
const intlRouter = new IntlRouter(
  directory: string, // The base directory used to browser localizable assets
  locales: string[], // The locales
  extensions?: string[], // The file extensions of the (page) files
  useCasesInUrls?: boolean // Use mixed-case URLs (by default `false`)
);

const rewrites = await intlRouter.getRewrites();
const redirects = await intlRouter.getRedirects();
```

### IntlLink

An `IntlLink` component is provided to use the existing build manifest to allow you to give a link `href` that uses the page's file directory path, and have that rendered as e.g. `<a href="/fr/nous/joindre/message-envoy%C3%A9">` in the French locale:

```js
import { IntlLink } from 'next-intl-router/lib/link';

export default function ContactUs() {
  return (
      <IntlLink href="/contact-us/message-sent">
        <a>Link using page id</a>
      </IntlLink>
  );
}
```

As the data for this mapping is not immediately available during rendering, add the following to your `next.config.js` to correctly prerender such links:

```js
module.exports = {
  ...,
  webpack(config, { dev, isServer }) {
    if (isServer && !dev) {
      const ssrLink = require.resolve('next-intl-router/lib/ssr-link');
      config.resolve.alias['next-intl-router/lib/link$'] = ssrLink;
    }
    return config;
  }
};
```

### IntlHead
IntlHead is a component to help with metadata. It will build alternate links and canonical URL.
This component should be inserted in a `<Layout />` component or if you prefer, you can add it in each of your pages 
and pass 
in `children` to add more metadata.

If you set locales as `['en-CA', 'fr-CA']` in the `i18n` object in your `next.config.js` file

Then when the home page is served, it will build the following alternate links:
```js
<link rel="alternate" hreflang="x-default" href="https://your-website.com"/>
<link rel="alternate" hreflang="en-CA" href="https://your-website.com/en-ca"/>
<link rel="alternate" hreflang="fr-CA" href="https://your-website.com/fr-ca"/>
```

If you visit https://your-site.com/who-we-are it will build the following alternate links and alternate canonical:

```js
<link rel="alternate" hreflang="fr-CA" href="https://your-website.com/fr-ca/qui-sommes-nous"/>
<link rel="canonical" href="https://your-website.com/en-ca/wo-we-are"/>
```

## Limitations
At this moment, we are not injecting the locale in the path if we are in the default locale

If you set `basePath` in your `next.config.js` file there might be some cases that are not yet handled.
