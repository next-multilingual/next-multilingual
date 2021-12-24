# ![next-multilingual](./assets/next-multilingual-banner.svg)

`next-multilingual` is an opinionated end-to-end solution for Next.js applications that requires multiple languages..

Check out our [demo app](https://next-multilingual-example.vercel.app)!

[![Try me](https://img.shields.io/badge/-Try%20me!-green?style=for-the-badge)](https://next-multilingual-example.vercel.app)

## Installation 💻

```
npm install next-multilingual
```

## What's in it for me? 🤔

- The enforcement of i18n best practices across your entire application.
- All URLs will use a locale prefix - this is currently a limitation of Next.js where the default locale does not use a prefix.
- Smart language detection that dynamically renders the homepage, without using redirections.
- The ability to use localized URLs (e.g., `/en-us/contact-us` for U.S. English and `/fr-ca/nous-joindre` for Canadian French).
- Automatically generate canonical and alternate links optimized for SEO.
- Modular localized string configuration support that works just like CSS (no more files containing shared strings).

## Before we start 💎

`next-multilingual` has put a lot of effort into adding [TSDoc](https://tsdoc.org/) to all its APIs. Please check directly in your IDE if you are unsure how to use certain APIs provided in our examples.

Also, having an opinion on "best practices" is not an easy task. This is why we documented our design decisions in a special document that can be consulted [here](./docs/design-decisions.md). If you feel that some of our APIs don't offer what you would expect, make sure to consult this document before opening an issue.

## Getting Started 💨

For those who prefer to jump right into the action, look in the [`example`](./example) directory for an end-to-end implementation of `next-multilingual`. For the rest, the section below will provide a complete, step by step, configuration guide.

## Step by step configuration ⚙️

### Configure Next.js

There are many options to configure in Next.js to achieve our goals. `next-multilingual` mostly cares about:

- Your unique application identifier: this will be used to ensure that your messages (localized strings) have unique identifiers.
- Your locales: we only support BCP47 language tags that contain both a country and language code.

We offer two APIs to simplify this step:

#### 〰️ `getConfig` (simple config)

This function will generate a Next.js config that will meet most use cases. `getConfig` takes the following arguments:

- `applicationId` — The unique application identifier that will be used as a messages key prefix.
- `locales` — The actual desired locales of the multilingual application. The first locale will be the default locale. Only BCP 47 language tags following the `language`-`country` format are accepted. For more details on why, refer to the [design decisions](./docs/design-decisions.md) document.
- `options` (optional) — Options part of a [Next.js configuration](https://nextjs.org/docs/api-reference/next.config.js/introduction) object.
- Also a few other arguments you probably will never need to use - check in your IDE (JSDoc) for more details.

`getConfig` will return a [Next.js configuration](https://nextjs.org/docs/api-reference/next.config.js/introduction) object.

To use it, simply add the following code in your application's `next.config.js`:

```js
const { getConfig } = require('next-multilingual/config');

const config = getConfig('exampleApp', ['en-US', 'fr-CA'], {
  poweredByHeader: false,
});

module.exports = config;
```

Not all configuration options are not supported by `getConfig`. If you ever happen to use one, an error message will point you directly to the next section: advanced config.

#### 〰️ `Config` (advanced config)

If you have more advanced needs, you can use the `Config` object directly and insert the configuration required by `next-multilingual` directly in an existing `next.config.js`. The arguments of `Config` are almost identical to `getConfig` (minus the `options`) - check in your IDE (TSDoc) for details. Here is an example of how it can be used:

```ts
const { Config } = require('next-multilingual/config');

const config = new Config('exampleApp', ['en-US', 'fr-CA']);

module.exports = {
  i18n: {
    locales: config.getUrlLocalePrefixes(),
    defaultLocale: config.getDefaultUrlLocalePrefix(),
    localeDetection: false,
  },
  poweredByHeader: false,
  webpack(config, { isServer }) {
    if (isServer) {
      config.resolve.alias['next-multilingual/link$'] = require.resolve(
        'next-multilingual/link/ssr'
      );
      config.resolve.alias['next-multilingual/head$'] = require.resolve(
        'next-multilingual/head/ssr'
      );
    }
    return config;
  },
  async rewrites() {
    return config.getRewrites();
  },
  async redirects() {
    return config.getRedirects();
  },
};
```

#### How does it work?

`next-multilingual/config` does 2 things leveraging Next.js' current routing capability:

1. Add [Rewrites](https://nextjs.org/docs/api-reference/next.config.js/rewrites) to link localized URLs to the default language URLs.
2. Add [Redirects](https://nextjs.org/docs/api-reference/next.config.js/redirects) to redirect all possible encoded URL [forms](https://unicode.org/reports/tr15/) to the normalized NFC URL.

`next-multilingual/config` also handles the special Webpack configuration required for server side rendering of localized
URLs using `next-multilingual/link/ssr` for `Link` components and `next-multilingual/head/ssr` for canonical and alternate links in the `Head` component.

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

import { getActualDefaultLocale, setCookieLocale } from 'next-multilingual';
import { useRouter } from 'next/router';

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

You might have noticed the `getActualDefaultLocale` API. This API is part of a [set of "utility" APIs](./src/index.ts) that helps abstract some of the complexity that we configured in Next.js. These APIs are very important, since we can no longer rely on the locales provided by Next.js. The main reason for this is that we set the default Next.js locale to `mul` (for multilingual) to allow us to do the dynamic detection on the homepage. These APIs are simple and more details are available in your IDE (JSDoc).

### Create a custom `Document` (`_document.tsx`)

We also need to create a [custom `Document`](https://nextjs.org/docs/advanced-features/custom-document) by adding [`_document.tsx`](./example/pages/_document.tsx) in the `pages` directory:

```ts
import { getActualLocale, normalizeLocale } from 'next-multilingual';
import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render(): JSX.Element {
    const { locale, locales, defaultLocale, props } = this.props.__NEXT_DATA__;
    const pagePropsActualLocale = props?.pageProps?.resolvedLocale;
    const actualLocale = pagePropsActualLocale
      ? pagePropsActualLocale
      : getActualLocale(locale, defaultLocale, locales);

    return (
      <Html lang={normalizeLocale(actualLocale)} translate="no" className="notranslate">
        <Head>
          <meta name="google" content="notranslate" />
        </Head>
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

This serves only 1 purpose: display the correct server-side locale in the `<html>` tag. Since we are using a "fake" default locale, it's important to keep the correct SSR markup, especially when resolving a dynamic locale on `/`. The `normalizeLocale` is not mandatory but a recommended ISO 3166 convention. Since Next.js uses the locales as URL prefixes, they are lower-cased in the configuration and can be re-normalized as needed.

### Configure all your pages to use SEO friendly markup

`next-multilingual/head` provides a `<Head>` component which automatically creates a canonical link and alternate links in the header. This is something that is not provided out of the box by Next.js.

#### Add a `NEXT_PUBLIC_ORIGIN` environment variable

As per [Google](https://developers.google.com/search/docs/advanced/crawling/localized-versions), alternate links must be fully-qualified, including the transport method (http/https). Because Next.js does not know which URL is used at build time, we need to specify the absolute URL that will be used, in an [environment variable](https://nextjs.org/docs/basic-features/environment-variables). For example, for the development environment, create an `.env.development` file at the root of your application with the following variable (adjust based on your setup):

```ini
NEXT_PUBLIC_ORIGIN=http://localhost:3000
```

Regardless of the environment, `next-multilingual` will look for a variable called `NEXT_PUBLIC_ORIGIN` to generate fully-qualified URLs. If you are using Next.js' [`basePath`](https://nextjs.org/docs/api-reference/next.config.js/basepath), it will be added automatically to the base URL.

`NEXT_PUBLIC_ORIGIN` will only accept fully qualified domains (e.g., `http://example.com`), without any paths.

## Using `next-multilingual` 🎬

Now that everything has been configured, we can focus on using `next-multilingual`!

### Creating the homepage

The homepage is a bit more complex than other pages, because we need to implement dynamic language detection (and display) for the following reason:

- Redirecting on `/` can have a negative impact on SEO and is not the best user experience.
- `next-multilingual` comes with a `getPreferredLocale` API that offers smarter auto-detection than the default Next.js implementation.

You can find a full implementation in the [example](./example/pages/index.tsx), but here is a stripped down version:

```tsx
import type { GetServerSideProps, NextPage } from 'next';
import {
  getActualDefaultLocale,
  getActualLocale,
  getActualLocales,
  getCookieLocale,
  getPreferredLocale,
  ResolvedLocaleServerSideProps,
  setCookieLocale,
} from 'next-multilingual';
import { getTitle, useMessages } from 'next-multilingual/messages';
import { useRouter } from 'next/router';

import Layout from '@/layout';

const Home: NextPage<ResolvedLocaleServerSideProps> = ({ resolvedLocale }) => {
  const router = useRouter();

  // Overwrite the locale with the resolved locale.
  router.locale = resolvedLocale;
  setCookieLocale(router.locale);

  // Load the messages in the correct locale.
  const messages = useMessages();

  return (
    <Layout title={getTitle(messages)}>
      <h1>{messages.format('headline')}</h1>
    </Layout>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps<ResolvedLocaleServerSideProps> = async (
  nextPageContext
) => {
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
      resolvedLocale,
    },
  };
};
```

In a nutshell, this is what is happening:

1. Let the server get the best locale for the page by:
   - Checking if a previously used locale is available in the `next-multilingual`'s locale cookie.
   - Otherwise, use smart locale detection based on the user's browsers settings.
2. The server then passes the resolved locale back to the client and:
   - The client overwrites the value on the router to make this dynamic across the application.
   - The value is also stored back in the cookie to keep the selection consistent

### Creating messages

Every time that you create a `tsx`, `ts`, `jsx` or `js` (compilable) file and that you need localized messages, you can simply create a message file in your supported locales that will only be usable by these files. Just like CSS modules, the idea is that you can have message files associated with another file's local scope. This has the benefit of making messages more modular and also avoids sharing messages across different contexts (more details in the [design decisions document](./docs/design-decisions.md) on why this is bad).

Message files have 2 main use cases:

- **Localized URLs**: for the pages in your `pages` directory, you can specify a localized URL segment (part of a URL in between `/` or at the end of the path) using the `slug` key identifier. More details on how to do this below.
- **All localizable strings**: they will store all the localizable strings (messages) used by your application. Each compilable file can have their own messages. Those messages will be available in local scope only, using the `useMessages` hook. Imagine CSS but for localizable strings.

To summarize:

- Messages are associated to a compilable file and should only be used in that local scope.
- Messages are used both to localize URLs and to display localized text everywhere in your application.
- You should only use this method in your application to simplify your localization process.

#### How do these files work?

Creating and managing those files is as simple as creating a style sheet, but here are the important details:

- The message files are `.properties` files. Yes, you might wonder why, but there are good reasons documented in the [design decision document](./docs/design-decisions.md).
- Make sure your file encoding is set to `UTF-8`. Not doing so will replace non-Latin characters with `�`.
- To leverage some of the built-in IDE support for `.properties` files, we follow a strict naming convention: `<PageFilename>.<locale>.properties`
- Each message must have unique keys that follow a strict naming convention: `<applicationId>.<context>.<id>` where:
  - **applicationId** must use the same value as set in `next-multilingual/config`
  - **context** must represent the context associated with the message file, for example `aboutUsPage` or `footerComponent` could be good examples of context. Each file can only contain 1 context and context should not be used across many files as this could cause "key collision" (non-unique keys).
  - **id** is the unique identifier in a given context (or message file).
  - Each "segment" of a key must be separated by a `.` and can only contain between 1 to 50 alphanumeric characters - we recommend using camel case for readability.
- For pages:
  - If you want to localize your URLs, you must include message files that include a key with the `slug` identifier.
  - If you want to customize your title with a description longer than the slug, include a key with the `title` identifier.
  - Use the `getTitle` API provided in `next-multilingual/messages` to automatically fallback between the `title` and `slug` keys.
- For components, files are only required if you use the `useMessages` hook.
- For messages shared across multiple components (shared messages), you need to create a "shared message hook". More details on how to do this below.

Also, make sure to check your console log for warnings about potential issues with your messages. It can be tricky to get used to how it works first, but we tried to make it easy to detect and fix problems. Note that those logs will only show in non-production environments.

#### Using messages for localized URLs

As mentioned previously, there is one special key for `pages`, where the `id` is `slug`. Unlike traditional slugs that look like `this-is-a-page`, we ask you to write the slug as a normal and human readable sentence, so that it can be translated like any other string. This avoids having special processes for slugs which can be costly and complex to manage in multiple languages.

Basically, the `slug` is the human readable "short description" of your page, and represents a segment (part between `/` or at the end of the path) of a URL. When used as a URL segment, the following transformation is applied:

- all characters will be lowercased
- spaces will be replaced by `-`

For example, `About Us` will become `about-us`.

For the homepage, the URL will always be `/` which means that `slug` keys will not be used to create localized URL segments.

Don't forget, slugs must be written as a normal short description, which means skipping words to keep it shorter for SEO is discouraged. The main reason for this, is that if you write "a bunch of keywords", a linguist who is not familiar with SEO might have a hard time translating that message. Having SEO specialists in many languages would also be very costly and difficult to scale. In an ideal scenario, market-specific SEO pages should probably be authored and optimized in the native languages, but this is no longer part of the translation process. `next-multilingual`'s focus is to provide an easy, streamlined solution to localize URLs in many languages.

The `slug` key will also be used as a fallback of the `title` key when using the `getTitle` API provided in `next-multilingual/messages`. This API makes it easy to customize titles when a slug feels insufficient.

> ⚠️ Note that changing a `slug` value means that a URL will change. Since those changes are happening in `next.config.js`, like any Next.js config change, the server must be restarted to see the changes in effect. The same applies if you change the folder structure since the underlying configuration relies on this.

If you want to have a directory without any pages, you can still localize it by creating an `index.<locale>.properties` file (where `locale` are the locales you support). While this option is supported, we don't recommend using it as this will make URL paths longer which goes against SEO best practice.

By default, `next-multilingual` will exclude some files like custom error pages, or any [API routes](https://nextjs.org/docs/api-routes/introduction) under the `/api` directory. You can always use `slug` keys when using messages for these files, but they will not be used to create localized URLs.

#### What do message files look like?

You can always look into the [example](./example) to see message files in action, but here is a sample that could be used on the homepage:

```properties
# Homepage title
exampleApp.homepage.title = Homepage
# Homepage headline
exampleApp.homepage.headline = Welcome to the homepage
```

### Creating other pages

Now that we learned how to create the homepage and some of the details around how things work, we can easily create other pages. We create many pages in the [example](./example), but here is a sample of what `about-us.jsx` could look like:

```jsx
import { NextPage } from 'next';
import { getTitle, useMessages } from 'next-multilingual/messages';

import Layout from '@/layout';

import styles from './index.module.css';

const AboutUs: NextPage = () => {
  const messages = useMessages();
  const title = getTitle(messages);
  return (
    <Layout title={title}>
      <h1 className={styles.headline}>{title}</h1>
      <p>{messages.format('details')}</p>
    </Layout>
  );
};

export default AboutUs;
```

And of course you would have this message file `about-us.en-US.properties`:

```properties
# Page localized URL segment (slug) in (translatable) human readable format.
# This key will be transformed when used in URLs. For example "About Us" will become "about-us".
# All characters will be lowercased and all spaces will be replaced by dashes.
exampleApp.aboutUsPage.slug = About Us
# Page details.
exampleApp.aboutUsPage.details = This is just some english boilerplate text.
```

### Adding links

`next-multilingual` comes with its own `<Link>` component that allows for client side and server side rendering of localized URL. It's usage is simple, it works exactly like Next.js' [`<Link>`](https://nextjs.org/docs/api-reference/next/link).

The only important thing to remember is that the `href` attribute should always contain the Next.js URL. Meaning, the file structure under the `pages` folder should be what is used and not the localized versions.

In other words, the file structure is considered as the "non-localized" URL representation, and `<Link>` will take care of replacing the URLs with the localized versions (from the messages files), if they differ from the structure.

The API is available under `next-multilingual/link` and you can use it like this:

```tsx
import Link from 'next-multilingual/link';
import { useMessages } from 'next-multilingual/messages';

export default function Menu(): JSX.Element {
  const messages = useMessages();

  return (
    <nav>
      <Link href="/">
        <a>{messages.format('home')}</a>
      </Link>
      <Link href="/about-us">
        <a>{messages.format('aboutUs')}</a>
      </Link>
      <Link href="/contact-us">
        <a>{messages.format('contactUs')}</a>
      </Link>
    </nav>
  );
}
```

Each of these links will be automatically localized when the `slug` key is specified in that page's message file. For example, in U.S. English the "Contact Us" URL path will be `/en-us/contact-us` while in Canadian French it will be `/fr-ca/nous-joindre`.

#### What about server side rendering?

As the data for this mapping is not immediately available during rendering, `next-multilingual/link/ssr` will take care of the server side rendering (SSR). By using `next-multilingual/config`'s `getConfig`, the Webpack configuration will be added automatically. If you are using the advanced `Config` method, this explains why the special Webpack configuration is required in the example provided prior.

### Adding links to other components

Not all links are using the `<Link>` component and this is also why Next.js has the `router.push` method that can be used by many other use cases. `next-multilingual` can support these use cases with the `useLocalizedUrl` hook that will return a localized URL, usable by any components. Here is an example on how it can be leveraged:

```tsx
import { NextPage } from 'next';
import { useLocalizedUrl } from 'next-multilingual/link';
import { useMessages } from 'next-multilingual/messages';
import router from 'next/router';

const Tests: NextPage = () => {
  const messages = useMessages();
  const localizedUrl = useLocalizedUrl('/about-us');
  return <button onClick={() => router.push(localizedUrl)}>{messages.format('clickMe')}</button>;
};

export default Tests;
```

### Creating components

Creating components is the same as pages but they live outside the `pages` directory. Also, the `slug` key (if used) will not have any impact on URLs. We have a few [example components](./example/components) that should be self-explanatory but here is an example of a `Footer.tsx` component:

```tsx
import { useMessages } from 'next-multilingual/messages';

export default function Footer(): JSX.Element {
  const messages = useMessages();
  return <footer>{messages.format('footerMessage')}</footer>;
}
```

And its messages file:

```properties
# This is the message in the footer at the bottom of pages
exampleApp.footerComponent.footerMessage = © Footer
```

Also make sure to look at the [language picker component example](./example/components/LanguagePicker.tsx) that is a must in all multilingual applications.

### Creating shared messages

We've been clear that sharing messages is a bad practice from the beginning, so what are we talking about here? In fact, sharing messages by itself is not bad. What can cause problems is when you share messages in different contexts. For example, you might be tempted to create a `Button.ts` shared message file containing `yesButton`, `noButton` keys - but this would be wrong. In many languages simple words such as "yes" and "no" can have different spellings depending on the context, even if it's a button.

When is it good to share messages? For lists of items.

For example, to keep your localization process simple, you want to avoid storing localizable strings in your database (more details on why in the [design decision document](./docs/design-decisions.md)). In your database you would identify the context using unique identifiers and you would store your messages in shared message files, where your key's identifiers would match the ones from the database.

To illustrate this we created [one example using fruits](./example/messages/useFruitsMessages.ts). All you need to do, is create a hook that calls `useMessages` like this:

```ts
import { useMessages } from 'next-multilingual/messages';

export const useFruitsMessages = useMessages;
```

Of course, you will have your messages files in the same directory:

```properties
exampleApp.fruits.banana = Banana
exampleApp.fruits.apple = Apple
exampleApp.fruits.strawberry = Strawberry
exampleApp.fruits.grape = Grape
exampleApp.fruits.orange = Orange
exampleApp.fruits.watermelon = Watermelon
exampleApp.fruits.blueberry = Blueberry
exampleApp.fruits.lemon = Lemon
```

And to use it, simple import this hook from anywhere you might need these values:

```tsx
import type { ReactElement } from 'react';
import { useFruitsMessages } from '../messages/useFruitsMessages';

export default function FruitList(): ReactElement {
  const fruitsMessages = useFruitsMessages();
  return (
    <>
      {fruitsMessages
        .getAll()
        .map((message) => message.format())
        .join(', ')}
    </>
  );
}
```

You can also call individual messages like this:

```ts
fruitsMessages.format('banana');
```

The idea to share those lists of items is that you can have a consistent experience across different components. Imagine a dropdown with a list of fruits in one page, and in another page an auto-complete input. But the important part to remember is that the list must always be used in the same context, not to re-use some of the messages in a different context.

### Message Variables

Using variables in messages is a critical functionality as not all messages contain static text. `next-multilingual` supports the [ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/) syntax out of the box which means that you can use the following message:

```properties
exampleApp.homepage.welcome = Hello {name}!
```

And inject back the values using:

```ts
messages.format('welcome', { name: 'John Doe' });
```

If you do not provide the values of your variables when formatting the message, it will simply output the message as static text.

#### Plurals

One of the main benefits of ICU MessageFormat is to use Unicode's tools and standards to enable applications to sound fluent in most languages. A lot of engineers might believe that by having 2 messages, one for singular and one for plural is enough to stay fluent in all languages. In fact, Unicode documented the [plural rules](https://unicode-org.github.io/cldr-staging/charts/latest/supplemental/language_plural_rules.html) of over 200 languages and some languages like Arabic can have up to 6 plural forms.

To ensure that your sentence will stay fluent in all languages, you can use the following message:

```properties
exampleApp.homepage.mfPlural = {count, plural, =0 {No candy left.} one {Got # candy left.} other {Got # candies left.}}
```

And the correct plural form will be picked, using the correct plural categories defined by Unicode:

```ts
messages.format('mfPlural', { count });
```

There is a lot to learn on this topic. Make sure to read the Unicode documentation and [try the syntax yourself](https://format-message.github.io/icu-message-format-for-translators/editor.html) to get more familiar with this under-hyped i18n capability.

### Search Engine Optimization

One feature that is missing from Next.js is managing important HTML tags used for SEO. We added the `<Head>` component to deal with two very important tags that live in the HTML `<head>`:

- Canonical links (`<link rel=canonical>`): this tells search engines that the source of truth for the page being browsed is this URL. Very important to avoid being penalized for duplicate content, especially since URLs are case insensitive, but Google treats them as case-sensitive.
- Alternate links (`<link rel=alternate>`): this tells search engines that the page being browsed is also available in other languages and facilitates crawling of the site.

The API is available under `next-multilingual/head` and you can import it like this:

```ts
import Head from 'next-multilingual/head';
```

Just like `<Link>`, `<Head>` is meant to be a drop-in replacement for Next.js' [`<Head>` component](https://nextjs.org/docs/api-reference/next/head). In our example, we are using it in the [Layout component](./example/layout/Layout.tsx), like this:

```tsx
<Head>
  <title>{title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
</Head>
```

All this does is insert the canonical and alternate links so that search engines can better crawl your application. For example, if you are on the `/en-us/about-us` page, the following HTML will be added automatically under your HTML `<head>` tag:

```html
<link rel="canonical" href="http://localhost:3000/en-us/about-us" />
<link rel="alternate" href="http://localhost:3000/en-us/about-us" hreflang="en-US" />
<link rel="alternate" href="http://localhost:3000/fr-ca/%C3%A0-propos-de-nous" hreflang="fr-CA" />
```

To fully benefit from the SEO markup, `<Head>` must be included on all pages. There are multiple ways to achieve this, but in the example, we created a `<Layout>` [component](./example/layout/Layout.tsx) that is used on all pages.

### Custom Error Pages

Like most sites, you will want to leverage Next.js' [custom error pages](https://nextjs.org/docs/advanced-features/custom-error-page) capability. With `useMessages()`, it's just as easy as creating any other pages. For example, for a `404` error, you can create your `404.tsx`:

```tsx
import { NextPage } from 'next';
import Link from 'next-multilingual/link';
import { getTitle, useMessages } from 'next-multilingual/messages';

import Layout from '@/layout';

const Custom400: NextPage = () => {
  const messages = useMessages();
  const title = getTitle(messages);
  return (
    <Layout title={title}>
      <h1>{title}</h1>
      <Link href="/">
        <a>{messages.format('goBack')}</a>
      </Link>
    </Layout>
  );
};

export default Custom400;
```

And of course, your messages, for example `404.en-US.properties`:

```properties
# Page title
exampleApp.pageNotFoundError.title = 404 - Page Not Found
# Go back link text
exampleApp.pageNotFoundError.goBack = Go back home
```

### Localized API Routes

One of Next.js' core features is its [builtin API support](https://nextjs.org/docs/api-routes/introduction). It's not uncommon for APIs to return content in different languages. `next-multilingual` has an equivalent API just for this use case: `getMessages`. Unlike the `useMessages` hook, `getMessages` can be used in API Routes. Here is an "Hello API" example on how to use it:

```ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getMessages } from 'next-multilingual/messages';

/**
 * Example API schema.
 */
type Schema = {
  message: string;
};

/**
 * The "hello API" handler.
 */
export default function handler(request: NextApiRequest, response: NextApiResponse<Schema>): void {
  const messages = getMessages(request.headers['accept-language']);
  response.status(200).json({ message: messages.format('message') });
}
```

This is very similar to the API implemented in the [example application](./example/pages/api). We are using the `Accept-Language` HTTP header to tell the API in which locale we want its response to be. Unlike the `useMessages` hook that has the context of the current locale, we need to tell `getMessages` in which locale to return messages.

Message files behave exactly the same as with `useMessages` You simply need to create one next to the API Route's file, in our case `hello.en-US.properties`:

```properties
# API message
exampleApp.helloApi.message = Hello, from API.
```

You can implement this in any pages, just like any other React-based API call, like this:

```tsx
const SomePage: NextPage = () => {
  const [apiError, setApiError] = useState(null);
  const [isApiLoaded, setApiIsLoaded] = useState(false);
  const [apiMessage, setApiMessage] = useState('');

  useEffect(() => {
    setApiIsLoaded(false);
    const requestHeaders: HeadersInit = new Headers();
    requestHeaders.set('Accept-Language', normalizeLocale(router.locale));
    fetch('/api/hello', { headers: requestHeaders })
      .then((result) => result.json())
      .then(
        (result) => {
          setApiIsLoaded(true);
          setApiMessage(result.message);
        },
        (apiError) => {
          setApiIsLoaded(true);
          setApiError(apiError);
        }
      );
  }, [router.locale]);

  function showApiMessage(): JSX.Element {
    if (apiError) {
      return (
        <>
          {messages.format('apiError')}
          {apiError.message}
        </>
      );
    } else if (!isApiLoaded) {
      return <>{messages.format('apiLoading')}</>;
    } else {
      return <>{apiMessage}</>;
    }
  }

  return (
    <div>
      <h2>{messages.format('apiHeader')}</h2>
      <div>{showApiMessage()}</div>
    </div>
  );
};
```

### Dynamic Routes

[Dynamic routes](https://nextjs.org/docs/routing/dynamic-routes) are very common and supported out of the box by Next.js. For simplicity, `next-multilingual` currently only supports [path matching](https://nextjs.org/docs/api-reference/next.config.js/rewrites#path-matching) which is also the most common dynamic route use case. To make dynamic routes work with `next-multilingual` all that you need to do is to use the `href` property as a `UrlObject` instead of a `string`. Just like any other links, we want to pass the non-localized path used by the Next.js' router (`pathname`). For dynamic routes, the router uses the bracket syntax (e.g., `[page]`) to identify parameters. For example, if you want to create a `<Link>` for for `/test/[id]` you will need to do the following:

```tsx
<Link href={{ pathname: '/test/[id]', query: { id: '123' } }} />
```

In `UrlObject`, parameters are stored in the `query` property, just like the Next.js router. In a language picker, we can use the properties coming directly from the router as shown in the example below:

```tsx
import {
  getActualLocale,
  getActualLocales,
  normalizeLocale,
  setCookieLocale,
} from 'next-multilingual';
import Link from 'next-multilingual/link';
import { useRouter } from 'next/router';

// Locales don't need to be localized.
const localeStrings = {
  'en-US': 'English (United States)',
  'fr-CA': 'Français (Canada)',
};

export default function LanguagePicker(): JSX.Element {
  const { pathname, locale, locales, defaultLocale, query } = useRouter();
  const actualLocale = getActualLocale(locale, defaultLocale, locales);
  const actualLocales = getActualLocales(locales, defaultLocale);

  return (
    <div>
      <button>
        {localeStrings[normalizeLocale(actualLocale)]}
        <i></i>
      </button>
      <div>
        {actualLocales
          .filter((locale) => locale !== actualLocale)
          .map((locale) => {
            return (
              <Link key={locale} href={{ pathname, query }} locale={locale}>
                <a
                  onClick={() => {
                    setCookieLocale(locale);
                  }}
                >
                  {localeStrings[normalizeLocale(locale)]}
                </a>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
```

Note that while this example is using the `<Link>` component, this is also supported by the `useLocalizedUrl` hook when other components are used.

There is one last thing that needs to be taken care of, and it's making query parameters available for SSR. By default Next.js' router will return `{}` for its `query` property. To fix this and get the SEO benefits from SSR markup, we can simply add a [`getStaticPaths`](https://nextjs.org/docs/basic-features/data-fetching#getstaticpaths-static-generation) or a [`getServerSideProps`](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering) on the page with the dynamic route. As soon as we add these, Next.js will make all the data available without any additional work. Here is an example using `getStaticPaths`:

```tsx
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      {
        params: {
          id: '123',
        },
      },
    ],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async () => {
  return { props: {} }; // Empty properties, since we are only using this for the static paths to work.
};
```

If you don't need the build-time optimization of `getStaticPaths`, you can also achieve this with a simple `getServerSideProps`:

```tsx
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} }; // Empty properties, since we are only using this to get the query parameters.
};
```

This allows a seamless experience across localized URLs when using simple parameters such as unique identifiers (e.g., UUIDs or numerical). If your parameter itself needs to be localized, you will have to handle that logic yourself using `getServerSideProps`.

We also provided a [fully working example](./example/pages/dynamic-route-test/[id].tsx) for those who want to see it in action.

## Translation Process 🈺

Our ideal translation process is one where you send the modified files to your localization vendor (while working in a branch), and get back the translated files, with the correct locale in the filenames. Once you get the files back you basically submit them back in your branch which means localization becomes an integral part of the development process. Basically, the idea is:

- Don't modify the files, let the translation management system (TMS) do its job.
- Add a localization step in your development pipeline and wait for that step to be over before merging back to your main branch.

We don't have any "export/import" tool to help as at the time of writing this document.

## Why `next-multilingual`? 🗳️

Why did we put so much effort into these details? Because our hypothesis is that it can have a major impact on:

- SEO
- Boosting customer trust with more locally relevant content.
- Making string management easier and more modular.

More details can be found on the implementation and design decision in the individual README files of each API and in the [documentation](./doc) directory.
