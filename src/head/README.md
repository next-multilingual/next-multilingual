# next-multilingual/head

`next-multilingual` comes with its own solution to fill a gap not currently supported by Next.js: SEO-friendly HTML markup.

## How does it work?

`next-multilingual/head` does 2 things leveraging Next.js' current routing capability:

1. Add [Rewrites](https://nextjs.org/docs/api-reference/next.config.js/rewrites) to link localized URLs to the default language URLs.
2. Add [Redirects](https://nextjs.org/docs/api-reference/next.config.js/redirects) to redirect all possible encoded URL [forms](https://unicode.org/reports/tr15/) to the normalized NFC URL.

For more details on how its used, refer back to the [main readme file](../../README.md). You can also look in the [`example`](../../example) directory to see a complete implementation using `MulHead` in action. And for more details on why we implemented `MulHead` this way, refer to the [design decisions](../../docs/design-decisions.md) document.