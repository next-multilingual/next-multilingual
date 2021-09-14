# Design Decisions

`next-multilingual` is an opinionated package, and the main reason behind that is research to back its decisions. This document
is meant to document that research and helpfully help other open source package to avoid some of the common pitfalls that a lot
of i18n solutions fell into.

## Localized URLs

Localized URLs is uncommon today, probably because a functioning implementation can be quite tricky. The other challenge is that to do this correctly there has to be synergy between what are often 2 completely independent functionalities: the router (which points URLs to web resources) and the string/message parser.

A lot of URL routers today use special configuration files to predetermine the available routes. Those files can be `JSON` or `YAML` and often contain their own configuration schema. The problem with this, is that these file mix localizable strings with non-localizable data. To localize these files would you either need a custom file parser, an import/export script or a human manually replacing the import/export script. This is not ideal and adds a lot of complexity and fragility around the localization process. This is why our solution leverages the current Next.js routing functionality using the file system and adds custom routes on top using the same modular string (messages) files that can easily be localized.

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
    1. There is no such concept as a "regionsless" variant of a language. Even English might seem like a simple language but there are many nuances between English U.S. and English U.K. By not specifying which variant is used, the content creator or the translator will have to decide and this can lead to inconsistency.
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

To better understand our decisions around messages (also knowns as localizable strings), we need to cover the end to end process.

### Localization patterns

Most developers are familiar with [design patterns](https://en.wikipedia.org/wiki/Software_design_pattern). As with any patterns, some are better than others in certain situations and others become anti-patterns. When it comes to internationalization (i18n) or localization (l10n), those patterns are not common knowledge. In fact, in a lot of projects, localization ends up becoming an after-thought. We decided to take a stab and identify the common patterns used today to help understand our decisions:

#### The global string repository

The idea of having a central place to manage all the strings of a business sound like a good idea. In fact, Netflix published an [article](https://netflixtechblog.com/localization-technologies-at-netflix-d033e7b13cf) about their internal solution that they were planning to open source. There has also been a few SaaS startups that appeared over the recent years that provide this type of all inclusive solution. The main benefits to this pattern:

- Localization is abstracted from developers and can be easier to use in some cases.
- Localization can be done in parallel of development and prevents from blocking the releases of new features.
- Depending on the implementation, it is possible to update messages (e.g. fix typos) without re-deploying an application

Since the developer experience (DX) in general is great, it seems like a good pattern, but we think that the down sides outweigh the benefits:

- When localization is done in parallel, if messages are changed during development, this will incur extra localization cost for unused strings. Cost will be exponential depending on the number of supported locales and to avoid them will promote a development process that will require more upfront preparation (less agile).
- It's easy to re-use existing messages. Not everyone is aware that where a message is used can have many implications in different languages and can lead to showing the wrong translation in the wrong context, in other words poor user experience. Sharing messages is considered an i18n bad practice and should be avoided.
- It's hard to track who uses which messages which means that updating or removing keys becomes impossible. This leads to an ever growing repository of messages where no-one is really sure who is using what and where. 
- Depending on the governance process, it can be easy to mix concerns and add non-localizable strings (JavaScript, constants, etc.) in the repository. This basically transforms the string repository into a configuration repository and can create extra cost around the localization process.
- This can cause challenges when adding new locales as you will need to pick and choose only the keys that are used for each application to avoid translating unused messages. This can be time consuming and error prone.
- Your translation memory (TM) will also grow exponentially with the number of locales you need to support which can lead to extra localization cost. Either vendors will charge you extra to manage this overhead or your in-house translation management system (TMS) infrastructure will cost more.

Of course, a lot of the down sides have less impacts for small businesses. But most small businesses have ambitions to grow; so why choose a pattern that will cause issues on the long run when there are better options.

We don't recommend using this pattern at all because on top of promoting the use of anti-patterns is goes against the [proximity principle](https://kula.blog/posts/proximity_principle/) which we believe is a key factor into successful localization. Have you heard heard of a global style repository where you would store all your CSS? Then why would messages be any different.

On the other hand, if you do have similar needs like Netflix where you have multiple products sharing the extract same messages with the same context, the "shared model" we will elaborate below might be a good alternative for you.

#### The database

Some localization use cases might involve a database. Imagine for example you are a large e-commerce website and you need to localize the products you sell (could be millions of products) that include names and descriptions. This type of content typically is stored in a database and will have APIs to perform CRUD operations but also a high performance distribution service to allow other functionalities like search.

When you need to store your messages in a database, you need to have the right schema to enable tracking of updates on individual strings. This allows to detect when content in some locales is more recent than others and can be used to trigger localization requests. Those requests are typically triggered using a custom middleware layer adapted to the database schema. It's also a good idea to isolate strings in special tables to avoid duplicated content which will also reduce the overall database size and increase performance.

##### Overall database localization can be complex, so when should it be used?

- The short answers is: only when you have no choice! It's easy to avoid storing messages in databases in most common use cases, for example:
  - An API with a small dataset that is self-contained. Try storing the messages with the rest of the application and load them in memory to avoid using a database while increasing performance.
  - Web applications that use a database. Avoid storing any messages in the database as they will complexify your localization process. Use identifiers instead, and if you need to share the strings with other application (e.g. backend and frontend), consider the "shared model" (more details below) instead.

##### What are examples of valid use cases?

- You are using a 3rd party application (e.g. a CMS) - make sure that when you pick those products, their localization tools will fit your needs.
- You have a large dataset that must be stored in a database.

#### The decentralized model

The decentralized model is heavily inspired from [CSS Modules](https://github.com/css-modules/css-modules) which is also supported by Next.js. Basically, the whole idea is to make each application responsible to manage their strings which means that adding, updating or removing strings becomes as easy as changing CSS. The main difference of course is that strings can only be changed in their source language and every time they change, they must trigger a localization process. 

This model is not sufficient on its own as a lot of i18n libraries today try to implement it but, on the way, breaks a few best practices (more details below) that can cause quality issues. Presuming a good implementation of his model, these are the benefits:

- It's easier to manage messages because they live closer to the code. Just like any other code, it should be possible to keep only the messages that are used, basically keep both the code and messages clean.
- By its nature, it should not promote sharing messages across applications. If implemented correctly, messages should only apply to local scopes which will avoid translation quality issues.
- Easier to integrate in a standard development cycle. Just like code reviews, messages can be reviewed and improved before being sent for translation. Not every developer has the same level of i18n knowledge and its better to fix source issues than to propagate them in many locales.

There are also downsides, when comparing mostly with the global string repository:

- Less transparent for developers. Unlike some global string repository implementations, developers are responsible to manage strings. But this also come with the benefit of better i18n knowledge.
- Requires deploying applications when changing messages. It might have been more problematic 10 years ago but nowadays, continuos deployment is part of most development pipelines.

From out perspective, the upsides outweigh the downsides - we believe that translation quality should be one of the top criteria when it comes to i18n. This means that the solution must be built around best practices and not around what is most convenient for developers. Therefore `next-multilingual` is built around this model.

#### The shared model

As mentioned previously, sharing messages is normally a bad practice. But in some cases, it might actually be required. The main problem around sharing messages is that while in English, it might sound like a good idea to have a `yes = yes` message, in many language `yes` might use different words depending on where it is used in an application (its context). This means, in cases where context is identical, it is OK to share strings. In most case, its hard to guarantee tha the context is identical, but here are scenarios where this could happen:

- You have a web app and native app that use the exact same layout.
- You have a frontend and backend service that needs to use the same localized messages.

If you need to share messages, we still encourage to try to scope messages locally to avoid out of context sharing. This type of sharing can be done in different ways but having a shared messages repository can be a good way to do this.

#### The ad-hoc model

Not relevant for our context, but we thought that it would still be worth mentioning that there are a lot of businesses running their localization process completely manually. The challenge with this, especially when it involves an application is that you need to correctly merge your files. It can get bad when running into merge conflicts, especially for languages someone is not familiar with.

### Localization process

It's hard to find a lot of details out there on how businesses handle their localization processes. For small startups, they can even use internal resources that are fluent in the languages they support to avoid this extra cost.

Normally once your business grows and you have frequent localization needs, you will hire a Language Service Provider (LSP). Depending on the LSP they will support different languages and you might even need to hire multiple LSPs depending on your needs.

LSPs use Translation Management Systems (TMS). This is the equivalent of an ERP, but for localization. It manages each project, which linguist is it assigned to, and track the cost, either per hour or word depending on the agreement. Most TMSes are commercial (paid) products and can be quite complex to manage. They try to support as many file types as possible so that out of the box, LSPs can focus on their core business: translation. When a file is following i18n best practice, the TMS will also store translations in a cache, called translation memory (TM). This is useful, because if you send the same file multiple time (adding messages during the development cycle), linguists will not have to re-translate messages that have already been translated. The TM help reduce the cost and time of translation. When you send a file to be translated, it will analyse it and check which segment (typically a sentence) can be found in the TM. When there is a perfect match, called "in context exact match" or "ICE match", translation will not be required. TMSes are quite flexible and allow different configurations to determine what is an ICE match, but the most common configuration use the message key. Meaning if the source key and source message is found in the TM, all translations will be ICE matches. Therefore it is critical to have unique keys. If you use simple keys, and have small messages, it would be easy to have duplicate entries in the TM, meaning the same source key and message would have multiple translations. If this happens, it can have negative impact on cost as those TMs entries will no longer be ICE matches and will require linguist intervention.

Most TMSes are document-base (file-based) - on other words they expect a file as a document to translate. Supporting different file types might sound simple, but it's not. Here are scenarios to illustrate this complexity:

- A marketing team wants to translate their ad campaigns that they managed in Excel files that include multiple tabs and macros. The TMS does not support the input file natively and, the LPS must ask their localization program manager to modify the file before it is sent to the TMS, and when translations are sent back, to manually re-integrate the changes. This can cause hours of manual work simply because the input file is not compatible. It also can cause quality issues as many manual steps are required and steps can easily be missed.
- Your CMS export its content in JSON files. For some reason the JSON file contains non-translatable data and keys are also not unique because of how the schema is built. This is preventing the TMS to use translation memory and increases the translation cost.

### File formats

As we just learned, file formats can be complex. We compared a few popular file formats to try to figure out which would
`next-multilingual` should use:

| File format   | Key/value based                 | Supports inline comment  | Built for l10n | Good TMS support
| ------------- | ------------------------------- | ------------------------ | -------------- | ----------------
| `.properties` | Yes                             | Yes                      | Yes            | Yes
| `JSON`        | No (supports complex structure) | No (would require JSON5) | No             | Depends on the schema
| `YAML`        | No (supports complex structure) | Yes                      | No             | Depends on the schema

The clear winner for us are `.properties` files. We know this choice might not be popular for all programming languages as this file format was originated from Java. But, it is the format that causes the least i18n problems and is widely supported out of the box. On top of that, some IDEs like JetBrains' (Webstorm, IntelliJ, etc.) come with a [resource bundle editor](https://www.jetbrains.com/help/idea/resource-bundle.html) that can help manage messages in multiple languages.

### Best practices

On top of everything we covered, there are still best practices that need to be followed to achieve true i18n efficiency, where adding a new locale become a simple task. Some of these cannot be programmatically enforced as they are related to the content itself So we rely on the knowledge of the developers that will write the messages:

- Use he right encoding. Normally [UTF-8](https://en.wikipedia.org/wiki/Popularity_of_text_encodings) should be used on all your files, including the source file, even if it only contains latin characters.
- Do not concatenate (break in multiple parts) sentences. TMSes works best with sentence, and by breaking sentences you will run into problem with right to left languages. Some messages might not be full sentences, but the idea is that a message is autonomous and does not rely on other messages where the order of messages could become problematic.
- Use named variables. Ideally variables should look like this `{myVar1}` so the name of the variable give a hint to the linguist what is going to be the value.
- Try to avoid hardcoding values where the format can vary on the locale, such as dates, numbers, and currencies. Many libraries handle this and ensure that the format is consistent across your application.
- Use MessageFormat for messages tha have plural forms. There are 6 plural forms in Arabic - do not try to handle this logic yourself as you will most likely end up creating problems.
- Add inline context to help linguist do their job. Some words have more than one meaning and without context you could end up with the wrong translation.
- If you are using inline HTML markup in your message and you have links with URLs, try to parametrize your URLs as they can often vary based on the language. Translators cannot translate URLs and it unless you provide context about why they are in the markup, they will most likely create confusion or send your users to the wrong link. 
- Use unique keys to lower your cost and improve your translation quality.

### Conclusion

In conclusion `next-multilingual` made the following decisions:

- `.properties` file will be used since they are the most appropriate forma to store messages.
- The scope of messages will be local: per pages or component.
- Messages will be identified by unique keys following the pattern `<application identifier>.<context>.<id>`.
- ICU MessageFormat will be used to handle plurals.


## SEO-friendly HTML markup

TODO

- canonical url
- x-default
- query params
