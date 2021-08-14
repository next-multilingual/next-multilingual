# ![next-multilingual](./assets/next-multilingual-banner.svg)

`next-multilingual` is an opinionated end-to-end solution for Next.js for applications that requires multiple languages.

## Installation 💻

```
npm install next-multilingual
```

## What's in it for me? 🤔

- The enforcement of i18n best practices across your entire application.
- All URLs will use a locale prefix - this is currently a limitation of Next.js where the default locale does not use a prefix.
- Smart language detection that dynamically renders the homepage, without using redirections.
- The ability to use localized URLs (e.g. `/en-us/contact-us` for U.S. English and `/fr-ca/nous-joindre` for Canadian French).
- Automatically generate canonical and alternate links optimized for SEO.
- Modular localized string configuration support that works just like CSS (no more files containing shared strings).

## Before we start 💎

`next-multilingual` has put a lot of effort to add [JSDoc](https://jsdoc.app/) to all its APIs. Please check directly in your IDE if you are unsure how to use certain APIs provided in our examples.

Also, having an opinion on "best practices" is not an easy task. This is why we documented our design decisions in a special document that can be consulted [here](./docs/design-decisions.md). If you feel that some of our APIs don't offer what you would expect, make sure to take a peek at this document before opening an issue.

## Getting Started 💨

For those who prefer to jump right into the action, look in the [`example`](./example) directory for an end-to-end implementation of `next-multilingual`. For the rest, the section below will provide a complete configuration guide in 3 simple steps.

## Step by step configuration ⚙️

### Configure Next.js

There are many options to configure in Next.js to achieve our goals. `next-multilingual` mostly cares about:

- Your unique application identifier: this will be used tto ensure that your messages (localized strings) have unique identifiers.
- Your locales: we only support BCP47 language tags that contains both a country and language code.

We offer two APIs to simplify this step:

#### 〰️ `getMulConfig` (simple config)

Short for "get multilingual configuration", this function will generate a Next.js config that will meet most use cases. Simply add the following code in your application's `next.config.js`:

```ts
const { getMulConfig } = require('next-multilingual/config');
module.exports = getMulConfig('exampleApp', ['en-US', 'fr-CA'], { poweredByHeader: false });
```

Some options are not supported by `getMulConfig`. If you try to use one, the error message should point you directly to the next section: advanced config.

#### 〰️ `MulConfig` (advanced config)

If you have more advanced needs, you can use the `MulConfig` object directly and insert the configuration required by `next-multilingual` directly in an existing `next.config.js`:

```ts
const { MulConfig } = require('next-multilingual/config');

const mulConfig = new MulConfig('exampleApp', ['en-US', 'fr-CA']);

module.exports = {
    serverRuntimeConfig = {
      nextMultilingual: {
        applicationIdentifier: mulConfig.applicationIdentifier,
      },
    }
    i18n: {
        locales: mulConfig.getUrlLocalePrefixes(),
        defaultLocale: mulConfig.getDefaultUrlLocalePrefix(),
        localeDetection: false
    },
    poweredByHeader: false,
    webpack(config, { isServer }) {
        if (isServer) {
            config.resolve.alias['next-multilingual/link$'] = require.resolve('next-multilingual/link/ssr');
        }
        return config;
    },
    async rewrites() {
        return mulConfig.getRewrites();
    },
    async redirects() {
        return mulConfig.getRedirects();
    }
};
```

For more details on the `next-multilingual/config` API, check its [README](./src/config/README.md) file.

### Configure our Babel plugin

#### 〰️ `next-multilingual/messages/babel-plugin`

To display localized messages with the `useMessages()` hook, we need to configure our custom [Babel](https://babeljs.io/) plugin that will automatically inject strings into pages and components. The [recommended way](https://nextjs.org/docs/advanced-features/customizing-babel-config) to do this is to include a `.babelrc` at the base of your application:

```json
{
  "presets": ["next/babel"],
  "plugins": ["next-multilingual/messages/babel-plugin"]
}
```

For more details on `next-multilingual/messages/babel-plugin`, check its [README](./src/messages/README.md) file.


### Create a custom `App` (`_app.tsx`)

We need to create a [custom `App`](https://nextjs.org/docs/advanced-features/custom-app) by adding [`_app.tsx`](./example/pages/_app.tsx) in the `pages` directory:

```ts
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { getActualDefaultLocale, setCookieLocale } from 'next-multilingual';

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const router = useRouter();
  const { locales, defaultLocale, locale } = router;
  /**
   * Next.js always expose the default locale with URLs without prefixes. If anyone use these URLs, we want to overwrite them
   * with the actual (default) locale.
   */
  if (locale === defaultLocale) {
    router.locale = getActualDefaultLocale(locales, defaultLocale);
  }
  setCookieLocale(router.locale); // Persist locale on page load (will be re-used when hitting `/`).

  return <Component {...pageProps} />;
}
```

This basically does two things, as mentioned in the comments:

1. Inject the actual locale in Next.js' router since we need to use a "fake default locale".
2. Persist the actual locale in the cookie so we can reuse it when hitting the homepage without a locale (`/`).

### Create a custom `Document` (`_document.tsx`)

We also need to create a [custom `Document`](https://nextjs.org/docs/advanced-features/custom-document) by adding [`_document.tsx`](./example/pages/_document.tsx) in the `pages` directory:

```ts
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ReactElement } from 'react';
import { getActualLocale, normalizeLocale } from 'next-multilingual';

class MyDocument extends Document {
  render(): ReactElement {
    const { locale, locales, defaultLocale, props } = this.props.__NEXT_DATA__;
    const pagePropsActualLocale = props?.pageProps?.resolvedLocale;
    const actualLocale = pagePropsActualLocale
      ? pagePropsActualLocale
      : getActualLocale(locale, defaultLocale, locales);

    return (
      <Html lang={normalizeLocale(actualLocale)}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
```

This serves only 1 purpose: display the correct server-side locale in the `<html>` tag. Since we are using a "fake" default locale, it's important to keep the correct SSR markup, especially when resolving a dynamic locale on `/`. The `normalizeLocale` is not mandatory but a recommended ISO 3166 convention. Since Next.js uses the locales as URLs prefixes, they are lower-cased in the configuration and can be re-normalized as needed.

### Configure all your pages to use SEO friendly markup

`next-multilingual/head` provides a `<MulHead>` component will automatically creates a canonical link and alternate links in the header. This is something that is not provided out of the box by Next.js.

#### Add a `NEXT_PUBLIC_ORIGIN` environment variable

As per [Google](https://developers.google.com/search/docs/advanced/crawling/localized-versions), alternate links must be fully-qualified, including the transport method (http/https). Because Next.js does not know which URL is used at build time, we need to specify the absolute URLs that will be used, in an [environment variable](https://nextjs.org/docs/basic-features/environment-variables). For example, for the development environment, create an `.env.development` file at the root of your application with the following variable (adjust based on your setup):

```ini
NEXT_PUBLIC_ORIGIN=http://localhost:3000
```

Regardless of the environment, `next-multilingual` will look for a variables called `NEXT_PUBLIC_ORIGIN` to generate fully-qualified URLs. If you are using Next.js' [`basePath`](https://nextjs.org/docs/api-reference/next.config.js/basepath), it will be added automatically to the base URL.

#### 〰️ `<MulHead>`

To benefit from the SEO markup, we need to include `<MulHead>` on all pages. There are multiple ways to achieve this, but in the example, we created a `<Layout>` [component](./example/layout/Layout.tsx) that uses our `<MulHead>` component. The following code will do the trick:

```jsx
<MulHead>
  <title>{title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</MulHead>
```

For more details on the `next-multilingual/head` API, check its [README](./src/head/README.md) file.

## Create pages and components 📄

Now that everything has been configured, we can focus on creating pages or components

TODO...

Add pages in your `pages` directory and for each page, add a `<Page-Name>.<locale>.properties` for all locales - localized routes will use the `title` key of the file to use in the localized URLs.


## Why `next-multilingual`? 🗳️

Why did we put so much efforts with these details? Because our hypothesis is that it can have a major impact on:

- SEO;
- boosting customer trust with more locally relevant content;
- making string management easier and more modular.

More details an be found on the implementation and design decision in the individual README files of each API and in the [documentation](./doc) directory. 