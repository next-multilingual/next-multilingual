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

For those who prefer to jump right into the action, look in the [`example`](./example) directory for an end-to-end implementation of `next-multilingual`. For the rest, the section below will provide a complete, step by step, configuration guide.

## Step by step configuration ⚙️

### Configure Next.js

There are many options to configure in Next.js to achieve our goals. `next-multilingual` mostly cares about:

- Your unique application identifier: this will be used tto ensure that your messages (localized strings) have unique identifiers.
- Your locales: we only support BCP47 language tags that contains both a country and language code.

We offer two APIs to simplify this step:

#### 〰️ `getMulConfig` (simple config)

Short for "get multilingual configuration", this function will generate a Next.js config that will meet most use cases. `getMulConfig` takes the following arguments:

- `applicationIdentifier` — The unique application identifier that will be used as a messages key prefix.
- `locales` — The actual desired locales of the multilingual application. The first locale will be the default locale. Only BCP 47 language tags following the `language`-`country` format are accepted. For more details on why, refer to the [design decisions](../../docs/design-decisions.md) document.
- `options` (optional) — Options part of a [Next.js configuration](https://nextjs.org/docs/api-reference/next.config.js/introduction) object.
- Also a few other arguments you probably will never need to use - check in your IDE (JSDoc) for more details.

`getMulConfig` will return a [Next.js configuration](https://nextjs.org/docs/api-reference/next.config.js/introduction) object.

To use it, simply add the following code in your application's `next.config.js`:

```ts
const { getMulConfig } = require('next-multilingual/config');
module.exports = getMulConfig('exampleApp', ['en-US', 'fr-CA'], { poweredByHeader: false });
```

Some options are not supported by `getMulConfig`. If you try to use one, the error message should point you directly to the next section: advanced config.

#### 〰️ `MulConfig` (advanced config)

If you have more advanced needs, you can use the `MulConfig` object directly and insert the configuration required by `next-multilingual` directly in an existing `next.config.js`. The argument of `MulConfig` are almost identical to `getMulConfig` (minus the `options`) - check in your IDE (JSDoc) for details. Here is an example of how it can be used:

```ts
const { MulConfig } = require('next-multilingual/config');

const mulConfig = new MulConfig('exampleApp', ['en-US', 'fr-CA']);

module.exports = {
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

#### How does it work?

`next-multilingual/config` does 2 things leveraging Next.js' current routing capability:

1. Add [Rewrites](https://nextjs.org/docs/api-reference/next.config.js/rewrites) to link localized URLs to the default language URLs.
2. Add [Redirects](https://nextjs.org/docs/api-reference/next.config.js/redirects) to redirect all possible encoded URL [forms](https://unicode.org/reports/tr15/) to the normalized NFC URL.

`next-multilingual/config` also handles the special Webpack configuration required for server side rendering of localized
URLs using `next-multilingual/link-ssr`.

For more details on the implementation such as why we are using UTF-8 characters, refer to the [design decisions](./docs/design-decisions.md) document.


### Configure our Babel plugin

#### 〰️ `next-multilingual/messages/babel-plugin`

To display localized messages with the `useMessages()` hook, we need to configure our custom [Babel](https://babeljs.io/) plugin that will automatically inject strings into pages and components. The [recommended way](https://nextjs.org/docs/advanced-features/customizing-babel-config) to do this is to include a `.babelrc` at the base of your application:

```json
{
  "presets": ["next/babel"],
  "plugins": ["next-multilingual/messages/babel-plugin"]
}
```

If you do not configure the plugin you will get an error when trying to use `useMessages`.

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

You might have noticed the `getActualDefaultLocale` API. his API is part of a [set of "utility" APIs](./src/index.ts) that helps abstract some of the complexity that we configured in Next.js. These APIs are very important, since we can no longer rely ono the locales provided by Next.js. The main reason for this is that we set the default Next.js locale to `mul` (for multilingual) to allow us to do the dynamic detection on the homepage. These APIs are simple and more details are available in your IDE (JSDoc).

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

`NEXT_PUBLIC_ORIGIN` will only accept fully qualified domains (e.g. `http://example.com`), without any paths.

## Using `next-multilingual` 🎬

Now that everything has been configured, we can focus on using `next-multilingual`!

### Creating the homepage

The homepage is a bit more complex than other pages, because we need to implement dynamic language detection (and display) for the following reason:

- Redirecting on `/` can have negative SEO impact, and is not the best user experience.
- `next-multilingual` comes with a `getPreferredLocale` API that offers smarter auto-detection than the default Next.js implementation.

You can find a full implementation in the [example](./example/pages/index.tsx), but here is a stripped down version:

```tsx
import {
  getActualLocales,
  getActualDefaultLocale,
  getActualLocale,
  getPreferredLocale,
  getCookieLocale
} from 'next-multilingual';
import type { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import Layout from '@/layout';
import { useMessages } from 'next-multilingual/messages';
import {
  ResolvedLocaleServerSideProps,
  setCookieLocale
} from 'next-multilingual';

export default function IndexPage({
  resolvedLocale
}: ResolvedLocaleServerSideProps): ReactElement {
  const router = useRouter();

  // Overwrite the locale with the resolved locale.
  router.locale = resolvedLocale;
  setCookieLocale(router.locale);

  // Load the messages in the correct locale.
  const messages = useMessages();

  return (
    <Layout title={messages.format('pageTitle')}>
      <h1>{messages.format('headline')}</h1>
    </Layout>
  );
}

export async function getServerSideProps(
  nextPageContext: NextPageContext
): Promise<{ props: ResolvedLocaleServerSideProps }> {
  const { req, locale, locales, defaultLocale } = nextPageContext;

  const actualLocales = getActualLocales(locales, defaultLocale);
  const actualDefaultLocale = getActualDefaultLocale(locales, defaultLocale);
  const cookieLocale = getCookieLocale(nextPageContext, actualLocales);
  let resolvedLocale = getActualLocale(locale, defaultLocale, locales);

  // When Next.js tries to use the default locale, try to find a better one.
  if (locale === defaultLocale) {
    resolvedLocale = cookieLocale
      ? cookieLocale
      : getPreferredLocale(
          req.headers['accept-language'],
          actualLocales,
          actualDefaultLocale
        ).toLowerCase();
  }

  return {
    props: {
      resolvedLocale
    }
  };
}
```

In a nutshell, this is what is happening:

1. Let the server get the best locale for the page by:
    - Checking if a previously used locale is available in the `next-multilingual`'s locale cookie.
    - Otherwise, use smart locale detection based on the user's browsers settings.
2. The server then passes the resolved locale back to the client and:
    - The client overwrites the value on the router to make this dynamic across the application.
    - The value is also stored back in the cookie to keep the selection consistent

### Creating messages

Every time we create a page, we also need to create the message files for each locales. These files will have 2 use cases:

- They will determine what the URL segment (part of a URL in between `/`) of this page is using the `pageTitle` key identifier.
- They will store all the localizable strings (messages) used by your application. Note that you should only put the message used in the page directly since components also have their own message files. Those messages will be used by the `useMessages` hook and will only be available in local scopes. Imagine CSS but for localizable stings.

#### How do these files work?

Creating and managing those files are as simple as creating a style sheet, but here are the important details:

- The message files are `.properties` file. Yes, you might wonder why, but there are good reasons documented in the [design decision document](./docs/design-decisions.md).
- To leverage some of the built-in IDE support for `.properties` files, we follow a strict naming convention: `<Page-Name>.<locale>.properties`
- For pages, you must at minimum create the message files, including the `pageTitle` key, of your default locale or Next.js will not start. Missing locales will trigger warning messages.
- For components, files are only required if you use the `useMessages` hook. The default locale is also mandatory and missing locales will trigger warning messages.
- Each message must have unique identifiers (keys) that follow a strict naming convention: `<application identifier>.<context>.<id>` where:

  - **application identifier** must use the same value as set in `next-multilingual/config`
  - **context** must represent the context associated with the message file, for example `aboutUsPage` or `footerComponent` could be good examples of context. Each file can only contain 1 context and context should not be used across many files as this could cause "key collision" (non-unique keys).
  - **id** is the unique identifier in a given context (or message file).
  - Each "segment" of a key must be separated by a `.` and can only contain between 3 to 50 alphanumerical characters - we recommend using camel case for readability.

Also, make sur to check your console log for warnings about potential issues with your messages. It can be tricky to get used to how it works first, but we tried to make it really easy to detect and fix problems. Note that those logs will only show in non-production environments.

#### Using messages for localized URLs

Also, as mentioned previously, there is one special key for `pages`, where the `id` is `pageTitle`. This message will be used both as a page title, but also as the localized URL segment of that page. Basically the "page title" is the human readable "short description" of your pages, and also represents a segment (contained between slashes) of a URL. When used as a URL segment, following changes are applied:

- all characters will be lowercased
- spaces will be replaced by `-`

For example `About us` will become `about-us`. For the homepage, the URL will always be `/` which means that `pageTitle` will not be used to create URL segments.

> ⚠️ Note that if you change `pageTitle`, this means that the URL will change. Since those changes are happening in `next.config.js`, like any Next.js config change, the server must be restarted to see the changes in effect. The same applies if you change the folder structure since the underlying configuration relies on this.

If you want to have a directory without any pages, you can still localize it by creating an `index.<locale>.properties` files (where `locale` are the locales you support). We don't really recommend this as this will make URL paths longer which goes against SEO best practice. But the option remains in case it is necessary.

#### What do messages file look like?

You can always look into the [example](./example) too see messages files in action, but here is a sample that could be used on the homepage:

```ini
# Homepage title (will not be used as a URL segment)
exampleApp.homepage.pageTitle = Homepage
# Homepage headline
exampleApp.homepage.headline = Welcome to the homepage
```
### Creating other pages

Now that we learned how to create the homepage and some the details around how things work, we can easily create other pages. We create many pages in the [example](./example) , but here is a sample of what `about-us.jsx` could look like:

```jsx
import { useMessages } from 'next-multilingual/messages';
import type { ReactElement } from 'react';
import Layout from '@/layout';

export default function AboutUs(): ReactElement {
  const messages = useMessages();
  return (
    <Layout title={messages.format('pageTitle')}>
      <h1>{messages.format('pageTitle')}</h1>
      <p>{messages.format('details')}</p>
    </Layout>
  );
}
```

And of course you would have its message file `about-us.en-US.properties`:

```ini
exampleApp.aboutUsPage.pageTitle = About Us
exampleApp.aboutUsPage.details = This is just some english boilerplate text.
```

### Adding links

`next-multilingual` comes with its own `<MulLink>` component that allow for client side and server side rendering of localized URL. It's usage is simple, it works exactly like Next.js' [`<Link>`](https://nextjs.org/docs/api-reference/next/link).

The only important thing to remember is that the `href` attribute should always contain the Next.js URL. Meaning, the file structure under the `pages` folder should be what is used and not the localized versions.

In other words, the file structure is considered as the "non-localized" URL representation, and `<MulLink>` will take care of replacing the URLs with the localized versions (from the messages files), if they differ from the structure.

The API is available under `next-multilingual/link` and you can use it like this:

```tsx
import { MulLink } from 'next-multilingual/link';

export default function ContactUs() {
  return (
    <>
      <MulLink href="/contact-us">
        <a>Contact us</a>
      </MulLink>
    </>
  );
}
```

In English the URL path will be `/en-us/contact-us`. But in when another locale is selected, you will get the localized URLs paths. See the example below for when `fr-ca` is selected:

```html
<a href="/fr-ca/nous-joindre"></a>
```

#### What about server side rendering?

As the data for this mapping is not immediately available during rendering, `next-multilingual/link/ssr` will take care of the server side rendering (SSR). By using `next-multilingual/config`'s `getMulConfig`, the Webpack configuration will be added automatically. If you are using the advanced `MulConfig` method, this explains on why the special Webpack configuration is required in the example provided prior.


### Creating components

Creating components is exactly the same as pages but they live outside the `pages` folder. Also as mentioned previously you do not need to add the `pageTitle` key. We have a few [example components](./example/components) that should be self explanatory. Also make sure to look at the [language picker component](./example/components/LanguagePicker.tsx) that is a must in all multilingual applications.

### Search Engine Optimization

One feature that is missing from Next.js is manage important HTML tags used for SEO. We added the `<MulHead>` component to deal with two very important tags that live in the HTML `<head>`:

- Canonical links (`<link rel=canonical>`): this tells search engines that the source of truth for the page being browsed is this URL. Very important to avoid being penalized for duplicate content, especially since URLs are case insensitive, but Google treats them as case-sensitive.
- Alternate links (`<link rel=alternate>`): this tells search engines that the page being browsed is also available in other languages and facilitates crawling of the site.

The API is available under `next-multilingual/head` and you can import it like this:

```ts
import { MulHead } from 'next-multilingual/head';
```

Just like `<MulLink>`, `<MulHead>` is meant to be a drop-in replacement for Next.js's [`<Head>` component](https://nextjs.org/docs/api-reference/next/head). In our example, we are using it in the [Layout component](./example/layout/Layout.tsx), like this:

```tsx
<MulHead>
  <title>{title}</title>
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  ></meta>
</MulHead>
```

All this does is insert the canonical and alternate links so that search engines can better crawl your application. For example, if you are on the `/en-us/about-us` page, the following HTML will be added automatically under your HTML `<head>` tag:

```html
<link rel="canonical" href="http://localhost:3000/en-us/about-us">
<link rel="alternate" href="http://localhost:3000/en-us/about-us" hreflang="en-US">
<link rel="alternate" href="http://localhost:3000/fr-ca/%C3%A0-propos-de-nous" hreflang="fr-CA">
```

To fully benefit from the SEO markup, `<MulHead>` must be included on all pages. There are multiple ways to achieve this, but in the example, we created a `<Layout>` [component](./example/layout/Layout.tsx) that is used on all pages.

## Translation process 🈺

Our ideal translation process is one where you send the modified files to your localization vendor (while working in a branch), and get back the translated files, with the correct locale in the filenames. Once you get the files back you basically submit them back in your branch which means localization becomes integral part of the development process. Basically the idea is:

- Don't modify the files, let the translation management system (TMS) do its job.
- Add a localization step in you development pipeline and wait for that step to be over before merging back to your main branch.

We don't have any "export/import" tool to help as at the time of writing this document.

## Why `next-multilingual`? 🗳️

Why did we put so much efforts with these details? Because our hypothesis is that it can have a major impact on:

- SEO;
- boosting customer trust with more locally relevant content;
- making string management easier and more modular.

More details an be found on the implementation and design decision in the individual README files of each API and in the [documentation](./doc) directory. 