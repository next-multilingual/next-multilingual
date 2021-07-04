# Design Decisions

`next-multilingual` is an opinionated package, and the main reason behind that is research to back its decisions. This document
is meant to document that research and helpfully help other open source package to avid some of the common pitfalls that a lot
of i18n solutions fell into.

## Localized URLs

Localized URLs is uncommon today, probably due to the fact that a functioning implementation can be quite tricky. The other challenge is that to do this correctly there has to be synergy between what are often 2 completely independent functionalities: the router (which points URLs to web resources) and the string/message parser.

A lot of URL routers today use special configuration files to predetermine the available routes. Those files can be `JSON` or `YAML` and often contain their own configuration schema. The problem with this, is that these file mix localizable strings with non-localizable data. To localize these files would you either need a custom file parser, an import/export script or a human manually replacing the import/export script. This is not ideal and adds a lot of complexity and fragility around the localization process. This is why our solution leverages the current Next.js routing functionality using the file system, and adds custom routes
on top using the same modular string (messages) files that can easily be localized.

What this means concretely is that instead of having:

```
English: https://somesite.com/en-us/about-us
French: https://somesite.com/fr-ca/about-us
```

You can now have the following localized URLs:

```
English: https://somesite.com/en-us/about-us
French: https://somesite.com/fr-ca/à-propos-de-nous
```

The hypothesis by having localized URLs:

- Better SEO searching for localized keywords that would be present in the URLs.
- Increased trust: localized URLs are more natural (locally relevant) to users.

### Design decisions

The following design decision have been considered when implementing **localized URLs**:

1. All URLs are lowercase (excluding dynamic route parameters):
   1. It's the recommended pattern by SEO professionals - [SEJ, 2020](https://www.searchenginejournal.com/url-capitalization-seo/)
   2. It's important to stay consistent with one pattern to avoid duplicate content issues - [Moz, 2021](https://moz.com/learn/seo/url)
2. All URLs are prefixed by a locale identifier just like Next.js, but unlike most examples, we do not recommend using a simple language code (see the "other recommendations" section below).
3. [BCP47 language tags](https://tools.ietf.org/search/bcp47) consisting of both an [ISO 639-1 alpha-2 language code](https://www.loc.gov/standards/iso639-2/php/code_list.php) and an [ISO 3166-1 alpha-2 country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) must be used at all times when setting up your `next.config.js`. Using a simple language code is not recommended because:
    1. There is no such concept as a "regionsless" variant of a language. Even English might seem like a simple language but there are many nuance between English U.S. and English U.K. By not specifying which variant is used, the content creator or the translator will have to decide and this can lead to inconsistency.
    2. On top of using different expressions, there are many other differences such as date, currency or number formats. If a site is using none of these, it might sound acceptable to simply use a language code but there are few use cases where this would apply.
    3. SEO: by targeting better the language with a country, your results will be more relevant in the search results of those countries - [Moz, 2021](https://moz.com/learn/seo/international-seo)
4. Encoded UTF-8 characters are used in URLs because:
   1. Google recommends using encoded UTF-8 characters in URLs for non-English sites - [Google, 2018](https://www.youtube.com/watch?v=74FiBesPkI4)
   2. It boosts SEO ranking in these languages and help gain customer trust - [Moz, 2013](https://moz.com/community/q/topic/30188/urls-in-greek-greeklish-or-english-what-is-the-best-way-to-get-great-ranking)
   3. Some markets (e.g. Japan, Russia) just expect non-latin characters in URLs - [SEJ, 2021](https://www.searchenginejournal.com/how-to-align-international-roadmap-with-google/)
5. Hyphens (`-`) are used to separate words, since it is the recommended standard - [Google, 2018](https://www.youtube.com/watch?v=74FiBesPkI4), [Backlinkto, 2020](https://backlinko.com/hub/seo/urls)

## Messages

TODO

- properties file
    - java implemetation
    - comments
- keys
    - unique
    - prefix

## SEO-friendly HTML markup

TODO

- canonical url
- x-default
- query params
