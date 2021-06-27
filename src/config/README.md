# next-multilingual/config

`next-multilingual` comes with its own solution to fill a gap not currently supported by Next.js: localized URLs. And yes, they
also support UTF-8 characters.

What this means concretely is that instead of having:

```
English: https://somesite.com/en-us/about-us
French: https://somesite.com/fr-ca/contact-us
```

You can now have the following localized URLs:

```
English: https://somesite.com/en-us/about-us
French: https://somesite.com/fr-ca/à-propos-de-nous
```

The hypothesis by having localized URLs:

- Better SEO searching for localized keywords that would be present in the URLs.
- Increased trust: if a user can related to the URL (is more locally relevant).


## How does it work?

`next-multilingual/router` does 2 things leveraging Next.js' current routing capability:

1) Add [Rewrites](https://nextjs.org/docs/api-reference/next.config.js/rewrites) to link localized URLs to the default language URLs.
2) Add [Redirects](https://nextjs.org/docs/api-reference/next.config.js/redirects) to redirect all possible encoded URL [forms](https://unicode.org/reports/tr15/) to the normalized NFC URL.

## Design decisions

`next-multilingual` is an opinionated package, and the following design decision have been considered for its `router`:

1) All URLs are lowercase (excluding dynamic route parameters):
    1) It's the recommended pattern by SEO professionals - [SEJ, 2020](https://www.searchenginejournal.com/url-capitalization-seo/)
    2) It's important to stay consistent with one pattern to avoid duplicate content issues - [Moz, 2021](https://moz.com/learn/seo/url)
2) All URLs are prefixed by a locale identifier just like Next.js, but unlike most examples, we do not recommend using a simple language code (see the "other recommendations" section below).
3) Encoded UTF-8 characters are used in URLs because:
    1) Google recommends using encoded UTF-8 characters in URLs for non-English sites - [Google, 2018](https://www.youtube.com/watch?v=74FiBesPkI4)
    2) It boosts SEO ranking in these languages and help gain customer trust - [Moz, 2013](https://moz.com/community/q/topic/30188/urls-in-greek-greeklish-or-english-what-is-the-best-way-to-get-great-ranking)
    3) Some markets (e.g. Japan, Russia) just expect non-latin characters in URLs - [SEJ, 2021](https://www.searchenginejournal.com/how-to-align-international-roadmap-with-google/)
34) Hyphens (`-`) are used to separate words, since it is the recommended standard - [Google, 2018](https://www.youtube.com/watch?v=74FiBesPkI4), [Backlinkto, 2020](https://backlinko.com/hub/seo/urls)

## Other recommendations

[BCP47 language tags](https://tools.ietf.org/search/bcp47) consisting of both an [ISO 639-1 alpha-2 language code](https://www.loc.gov/standards/iso639-2/php/code_list.php) and an [ISO 3166-1 alpha-2 country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) should be used at all times when setting up your `next.config.js`. Using a simple language code is not recommended because:

1) There is no such concept as a "regionsless" variant of a language. Even English might seem like a simple language but there are many nuance between English U.S. and English U.K. By not specifying which variant is used, the content creator or the translator will have to decide and this can lead to inconsistency.
2) On top of using different expressions, there are many other differences such as date, currency or number formats. If a site is using none of these, it might sound acceptable to simply use a language code but there are few use cases where this would apply.
3) SEO: by targeting better the language with a country, your results will be more relevant in the search results of those countries - [Moz, 2021](https://moz.com/learn/seo/international-seo)

## Annex

### Definitions

_Inspired from the [Wikipedia](https://en.wikipedia.org/wiki/URL) definitions._

- **URL**: also called URI or web address, follows the following pattern
  `scheme:[//[userinfo@]host[:port]]path[?query][#fragment]`.
- **URL path**: the path portion of a URL (see URL pattern). In route configurations, a path can be partial and
  contain more than one segment.
- **URL path segment**: a portion of the path contained between slashes (`/`).
- **Route**: an object that links a URL to its resource on the server.
- **Route configuration**: a configuration or part of a configuration that defines a route.

