# next-multilingual/router

`next-multilingual` comes with its own router to fill a simple gap not currently supported by Next.js: localized URLs.

What this means concretely is that instead of having (it also supports UTF-8 characters):

```
English: https://somesite.com/en-us/about-us
French: https://somesite.com/fr-fr/contact-us
```

You can now have the following localized URLs:

```
English: https://somesite.com/en-us/about-us
French: https://somesite.com/fr-ca/à-propos-de-nous
```

The hypothesis by having localized URLs:

- Better SEO searching for localized keywords that would be present in the URLs.
- Increased trust: if a user can related to the URL (is more locally relevant).


## Usage

Look in `example/next.config.js` to see a complete implementation in action.

## How does it work?

`next-multilingual/router` does 2 things leveraging Next.js' current routing capability:

1) Add [Rewrites](https://nextjs.org/docs/api-reference/next.config.js/rewrites) to link localized URLs to the default language URLs.
2) Add [Redirects](https://nextjs.org/docs/api-reference/next.config.js/redirects) to redirect all possible encoded URL [forms](https://unicode.org/reports/tr15/) to the normalized NFC URL.

## Design opinions

`next-multilingual` is an opinionated package, and the following design decision have been considered for its `router`:

1) All URLs are lowercase (excluding dynamic route parameters):
    1) It's the recommended pattern by SEO professionals - [SEJ, 2020](https://www.searchenginejournal.com/url-capitalization-seo/)
    2) It's important to stay consistent with one pattern to avoid duplicate content issues - [Moz, 2021](https://moz.com/learn/seo/url)
2) Encoded UTF-8 characters are used in URLs because:
    1) Google recommends using encoded UTF-8 characters in URLs for non-English sites - [Google, 2018](https://www.youtube.com/watch?v=74FiBesPkI4)
    2) It boosts SEO ranking in these languages and help gain customer trust - [Moz, 2013](https://moz.com/community/q/topic/30188/urls-in-greek-greeklish-or-english-what-is-the-best-way-to-get-great-ranking)
    3) Some markets (e.g. Japan, Russia) just expect non-latin characters in URLs - [SEJ, 2021](https://www.searchenginejournal.com/how-to-align-international-roadmap-with-google/)
3) Hyphens (`-`) are used to separate word, since it is the recommended standard - [Google, 2018](https://www.youtube.com/watch?v=74FiBesPkI4), [Backlinkto, 2020](https://backlinko.com/hub/seo/urls)
