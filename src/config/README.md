# next-multilingual/config

`next-multilingual` comes with its own solution to fill a gap not currently supported by Next.js: localized URLs. And yes, they
also support UTF-8 characters.

## How does it work?

`next-multilingual/config` does 2 things leveraging Next.js' current routing capability:

1) Add [Rewrites](https://nextjs.org/docs/api-reference/next.config.js/rewrites) to link localized URLs to the default language URLs.
2) Add [Redirects](https://nextjs.org/docs/api-reference/next.config.js/redirects) to redirect all possible encoded URL [forms](https://unicode.org/reports/tr15/) to the normalized NFC URL.

`next-multilingual/config` also handles the special Webpack configuration required for server side rendering of localized
URLs using `next-multilingual/link-ssr`.

For more details on the implementation, refer to the [design decisions](../../docs/design-decisions.md) document.