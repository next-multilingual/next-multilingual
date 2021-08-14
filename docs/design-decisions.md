# Design Decisions

`next-multilingual` is an opinionated package, and the main reason behind that is research to back its decisions. This document
is meant to document that research and helpfully help other open source package to avoid some of the common pitfalls that a lot
of i18n solutions fell into.

## Localized URLs

Localized URLs is uncommon today, probably due to the fact that a functioning implementation can be quite tricky. The other challenge is that to do this correctly there has to be synergy between what are often 2 completely independent functionalities: the router (which points URLs to web resources) and the string/message parser.

A lot of URL routers today use special configuration files to predetermine the available routes. Those files can be `JSON` or `YAML` and often contain their own configuration schema. The problem with this, is that these file mix localizable strings with non-localizable data. To localize these files would you either need a custom file parser, an import/export script or a human manually replacing the import/export script. This is not ideal and adds a lot of complexity and fragility around the localization process. This is why our solution leverages the current Next.js routing functionality using the file system, and adds custom routes on top using the same modular string (messages) files that can easily be localized.

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

### What are good SEO practices in terms of URLs?

Based on the [2021 research](https://backlinko.com/google-ranking-factors) from Backlinkto:

1. The shorter the URL the better.
2. Keep URL depth as low as possible (the less segments, the better)
3. Readable - the URL must be readable (stop words like a, an, or can be omitted to save length if readability is
   preserved)
4. URL strings - it's possible to add human readable strings that will show directly in Google search results using
   schema.org breadcrumbs for example.
5. Every URL should have a `title` attribute when using them in `<a>` tags


## Messages

Ideas:

- history around modes of localization:
   - central string repo
   - large datasets
   - decentralized model (what we recommend)
- localization process explained
- importance of unique keys
- ecc.

--- to review ->

### Configure your application identifier

`next-multilingual/messages` comes with the `useMessage` hook that provides easy access to messages (also known as localized strings). Each message is identified with a key and most i18n libraries out there seem to encourage both using short keys and/or sharing keys within the same application. `next-multilingual` enforces the use of unique keys, not only within the same application but across multiple applications. To help enforce this, you need to configure an application identifier in an `.env.local` file at the root of your application:

```ini
# This is the `next-multilingual` application identifier that will be used as a messages keys prefix.
NEXT_MULTILINGUAL_APPID=exampleApp
```

This application identifier will need to be used in all your message keys, as a prefix following the `next-multilingual` key format: `<appId>.<context>.<id>` where:

- **appId** (application identifier) must use the same value as configured in `NEXT_MULTILINGUAL_APPID`
- **context** must represent the context associated with the message file, for example `aboutUsPage` or `footerComponent` could be good example of context. Each file can only contain 1 context and context should not be used across many files as this could cause "key collision" (non-unique keys).
- **id** is the unique identifier in a given context (or message file).
- Each "segment" of a key must be separated by a `.` and can only contain alphanumerical characters - we recommend using camel case for readability.

More details around why unique keys are important can be found in the `messages` section in the [design decisions](./docs/design-decisions.md) document.


----

TODO

- properties file
    - java implemetation
    - comments
- keys
    - unique
    - prefix

We enforce the use of prefix for keys, because:

- All key must be unique, across an application, and when in big companies, ideally across the entire business:
  - When strings are translated, linguist most often uses [Translation Management Systems](https://en.wikipedia.org/wiki/Translation_management_system) (TMS)
  - All TMSes use a translation cache, called "translation memory" (TM)
  - TMs store translated string and the "key" of a string can play a big role in the matching strategy when re-using previously translated strings
  - When using non-unique keys, this prevents more accurate matches and and can both increase translation cost or reduce translation quality


## SEO-friendly HTML markup

TODO

- canonical url
- x-default
- query params
