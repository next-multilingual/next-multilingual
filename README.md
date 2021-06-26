# next-multilingual

An opinionated end-to-end **multilingual** solution for Next.js.

## Installation

```
npm install next-multilingual
```

## What's in it for me?

- The enforcement of i18n best practices across your entire application.
- All URLs will use a language prefix - this is currently a limitation of Next.js where the default locale does not use a prefix.
- A smart language detection that dynamically renders the homepage, without using redirections.
- The ability to use localized URLs (e.g. `/en-us/contact-us` for U.S. English and `/fr-ca/nous-joindre` for Canadian French).
- Automatically generated alternative links for SEO, using localized URLs.
- Modular localized string configuration support that works just like CSS (no more files containing shared strings).

## Usage

If you prefer to see a complete implementation, look in the `example` directory, otherwise the section below will provide a
step-by-step configuration guide.

### Step 1: Configure Next.js

There are many options to configure in Next.js to achieve our goals. We offer two APIs to simplify this step:

1) The `getMulConfig` function.

Short for "get multilingual configuration", this function will generate a Next.js config that will meet most use cases. Simply add the following code in your application's `next.config.js`:

```js
const { getMulConfig } = require('next-multilingual/config');
module.exports = getMulConfig(['en-US', 'fr-CA'], { poweredByHeader: false });
```

2) If you have more advanced needs, you can use the `MulConfig` object:

```js
const { MulConfig } = require('next-multilingual/config');

const mulConfig = new MulConfig(['en-US', 'fr-CA']);

module.exports = {
    i18n: {
        locales: mulConfig.getUrlLocalePrefixes(),
        defaultLocale: mulConfig.getDefaultUrlLocalePrefix(),
        localeDetection: false
    },
    publicRuntimeConfig: {
        origin: 'http://localhost:3000'
    },
    poweredByHeader: false,
    webpack(config, { isServer }) {
        if (isServer) {
            config.resolve.alias['next-multilingual/link$'] = require.resolve('next-multilingual/link-ssr');
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
        return mulConfig.getRewrites();
    },
    async redirects() {
        return mulConfig.getRedirects();
    }
};

```

For more details on the `next-multilingual/config` API, check its [README](./src/config/README.md) file.

### Step 2: Create Pages

Add pages in your `pages` directory and for each page, add a `<Page-Name>.<locale>.properties` for all locales - localized routes will use the `title` key of the file to use in the localized URLs.

### Step 3: Add alternative links (SEO-friendly HTML markup)


## Why `next-multilingual`?

Why did we put so much efforts with these details? Because our hypothesis is that it can have a major impact on:

- SEO;
- boosting customer trust with more locally relevant content;
- making string management easier and more modular.

More details an be found on the implementation and design decision in the readme files of each API. 