# next-multilingual/link







### IntlLink

An `IntlLink` component is provided to use the existing build manifest to allow you to give a link `href` that uses the page's file directory path, and have that rendered as e.g. `<a href="/fr/nous/joindre/message-envoy%C3%A9">` in the French locale:

```tsx
import { IntlLink } from 'next-multilingual/lib/link';

export default function ContactUs() {
  return (
    <>
      <IntlLink href="/contact-us/message-sent">
        <a>Link using page id</a>
      </IntlLink>
    </>
  );
}
```

As the data for this mapping is not immediately available during rendering, add the following to your `next.config.js` to correctly prerender such links:






`next-multilingual` comes with its own router to fill a simple gap not currently supported by Next.js: localized URLs.

What this means concretely is that instead of having (it also supports UTF-8 characters):

```
English: https://somesite.com/en-us/contact-us
French: https://somesite.com/fr-fr/contact-us
```

You can now have the following localized URLs:

```
English: https://somesite.com/en-us/contact-us
French: https://somesite.com/fr-fr/nous-joindre
```

The hypothesis by having localized URLs:

- Better SEO searching for localized keywords that would be present in the URLs.
- Increased trust: if a user can related to the URL (is more locally relevant).


## Usage

Look in `example/next.config.js` to see a complete implementation in action.

## How does it work?

`next-multilingual/router` does 2 things leveraging Next.js's current routing capability:

1) Add [Rewrites](https://nextjs.org/docs/api-reference/next.config.js/rewrites) to link localized URLs to the default language URLs.
2) Add [Redirects](https://nextjs.org/docs/api-reference/next.config.js/redirects) to redirect all possible encoded URL [forms](https://unicode.org/reports/tr15/) to the normalized NFC URL.
