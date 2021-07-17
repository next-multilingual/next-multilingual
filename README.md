# next-multilingual

An opinionated end-to-end **multilingual** solution for Next.js.

## Installation

```
npm install next-multilingual
```

## What's in it for me?

- The enforcement of i18n best practices across your entire application.
- All URLs will use a locale prefix - this is currently a limitation of Next.js where the default locale does not use a prefix.
- Smart language detection that dynamically renders the homepage, without using redirections.
- The ability to use localized URLs (e.g. `/en-us/contact-us` for U.S. English and `/fr-ca/nous-joindre` for Canadian French).
- Automatically generate canonical and alternate links optimized for SEO.
- Modular localized string configuration support that works just like CSS (no more files containing shared strings).

## Usage

For those who prefer to jump right into the action, look in the [`example`](./example) directory for an end-to-end implementation of `next-multilingual`. For the rest, the section below will provide a complete configuration guide in 3 simple steps.

### ✔️ Step 1️: Configure Next.js

There are many options to configure in Next.js to achieve our goals. We offer two APIs to simplify this step:


#### 〰️ `getMulConfig` (simple config)

Short for "get multilingual configuration", this function will generate a Next.js config that will meet most use cases. Simply add the following code in your application's `next.config.js`:

```js
const { getMulConfig } = require('next-multilingual/config');
module.exports = getMulConfig(['en-US', 'fr-CA'], { poweredByHeader: false });
```

#### 〰️ `MulConfig` (advanced config)

If you have more advanced needs, you can use the `MulConfig` object directly and insert the configuration required by `next-multilingual` directly in an existing `next.config.js`:

```js
const { MulConfig } = require('next-multilingual/config');

const mulConfig = new MulConfig(['en-US', 'fr-CA']);

module.exports = {
    i18n: {
        locales: mulConfig.getUrlLocalePrefixes(),
        defaultLocale: mulConfig.getDefaultUrlLocalePrefix(),
        localeDetection: false
    },
    poweredByHeader: false,
    webpack(config, { isServer }) {
        if (isServer) {
            config.resolve.alias['next-multilingual/link$'] = require.resolve('next-multilingual/link-ssr');
        }

        config.module.rules.push({
            test: /\.properties$/,
            loader: 'next-multilingual/properties',
        });
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

Optionally, if you want better type completion for your IDE, you can add a `declarations.d.ts` at the root of your application with the following content:

```js
declare module '*.properties' {
  const messages: { readonly [key: string]: string };
  export default messages;
}
```

### ✔️ Step 2: Create Pages

Before creating the first page, we need to make sure that your application can support dynamic locale resolution.

#### 〰️ Custom `App` (`_app.tsx`)

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

1) Inject the actual locale in Next.js' router since we need to use a "fake default locale".
2) Persist the actual locale in the cookie so we can reuse it when hitting the homepage without a locale (`/`).

We also need to create a [custom `Document`](https://nextjs.org/docs/advanced-features/custom-document
) by adding [`_document.tsx`](./example/pages/_document.tsx) in the `pages` directory:

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

TODO...

propertiesloader.. etc

Add pages in your `pages` directory and for each page, add a `<Page-Name>.<locale>.properties` for all locales - localized routes will use the `title` key of the file to use in the localized URLs.

### ✔️ Step 3: Add SEO friendly HTML markup for your URLs

As per [Google](https://developers.google.com/search/docs/advanced/crawling/localized-versions), alternate links must be fully-qualified, including the transport method (http/https). Because Next.js does not know which URL is used at build time, we need to specify the absolute URLs that will be used, in an [environment variable](https://nextjs.org/docs/basic-features/environment-variables). For example, for the development environment, create an `.env.development` file at the root of your app with the following variable (adjust based on your setup):

```conf
NEXT_PUBLIC_ORIGIN="http://localhost:3000"
```

Regardless of the environment, `next-multilingual` will look for a variables called `NEXT_PUBLIC_ORIGIN` to generate fully-qualified URLs. If you are using Next.js' [`basePath`](https://nextjs.org/docs/api-reference/next.config.js/basepath), it will be added automatically to the base URL.

#### 〰️ `MulHead`

Now all that you need to do is add the `MulHead` component to your pages. We recommend to use it on all pages, and if you are
using a [`Layout`](./example/layout/Layout.tsx) component like in the [example](./example), the following code will do the trick:

```jsx
<MulHead>
    <title>{title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</MulHead>
```

## Why `next-multilingual`?

Why did we put so much efforts with these details? Because our hypothesis is that it can have a major impact on:

- SEO;
- boosting customer trust with more locally relevant content;
- making string management easier and more modular.

More details an be found on the implementation and design decision in the individual README files of each API and in the [documentation](./doc) directory. 