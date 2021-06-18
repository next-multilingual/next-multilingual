# Routes

When creating a web application, one of the main piece of information used to trigger the right action is the URL. This
is where routes come into play. A route is the link between a client's HTTP request to the web application, and the
controller of a web application that is responsible to perform the correct action.

## Definitions

_Inspired from the [Wikipedia](https://en.wikipedia.org/wiki/URL) definitions._

- **URL**: also called URI or web address, follows the following pattern
  `scheme:[//[userinfo@]host[:port]]path[?query][#fragment]`.
- **URL path**: the path portion of a URL (see URL pattern). In route configurations, a path can be partial and
  contain more than one segment.
- **URL path segment**: a portion of the path contained between slashes (`/`).
- **Route**: an object that links a URL (and its components) with the controller of a web application.
- **Route configuration**: a configuration or part of a configuration that defines a route.

## What are good URLs?

One feature that seems to lack on many website is localized URLs. We can see many billion $ enterprises that does not
use this today. So what does a good localized URL look like?

- the homepage (/) will detect the best supported locale and show this content (its the only URL without a locale)
- all other URLs are prefixed by standard BCP47 codes (language codes are not sufficient to cover date, numbers and
  other format)
- all URLs should use UTF-8 characters (depending on the targeted user) in the segments following the BCP47 codes
  (https://support.google.com/webmasters/thread/13540685)
- all spaces should be replaced by hyphens (https://developers.google.com/search/docs/advanced/guidelines/url-structure)
- all URLs are kept lowercase for stylistic reasons (other than potential variables that would contain an identifier)
- all URLs should be treated as cases sensitive to avoid SEO penalties of having duplicate content
- no indexable URL should have duplicate content used by another URL to avoid negative SEO impact
- no URL should end with a slash
- URL segment variables should be used instead of query parameters
- there should be a link between localized URLs pointing to the same page to enable the use of a smart language switcher

## Why is this problem so difficult to solve?

Internationalization (i18n) in general is a hard problem because most engineers are not familiar with how the
localization process works. On top of that, languages are inherently complex. Supporting multiple languages is not
standard and many countries (like the U.S.) will think twice before doing that, mainly because of their local market.
And what happens is when the need arise, implementing this correctly can be disruptive and a lot of implementations will
end up requiring manual steps on top of being fragile. Even supporting two languages is easy to get wrong when you add
more languages if details like plural rules, date, number formatting and text direction is not considered from the
beginning. Now if we want to start good i18n with URLs, we are adding one more layer of complexity.

## How does this fit into the development cycle?

As we automate everything, most companies want to merge to the `master` branch and automatically deploy their
applications. What about localization? Traditionally most big companies had their own translation management system
(TMS) and doing localization was a complex and costly process that would require custom development to automate.
Recently most commercial TMS have started supporting automation using standard development data repository such as Git.
On top of that, a lot of smaller players are offering continuous localization as a service today.

What does this mean? This means that if we find a good way to both support URL and string localization that fits into
continuous localization solutions, we no longer need custom development or manual steps.

## How does continuous localization work today?

Continuous localization needs a way to get the localizable asset in a source language, and return the translated assets
in a set of configured target languages. Every word translated will incur fees, so we need to send requests when we feel
confident that the content is ready to be translated. A common pattern could be to isolate features in feature branches
and merge them back to `master` once the localization has been returned back into that branch.

## What are common anti-patterns?

- Mixing the strings with the code: while TMS can parse various file formats, they will not parse code. Using a solution
  that will mix the strings with the code will require to have another process to export/import those string from the
  code and can become complex/fragile when trying to automate the process.
- Using the right file format: a lot of solutions out there use JSON to store strings. While this can be convenient for
  developers, there is no way to provide context (comments) with the strings. This is why it's better to use a widely
  supported format like the Java Bundle `.properties` files to make sure that linguists will have all the information
  they need when translating a string. Other benefits of using `.properties` files is that they only support key and
  values unlike JSON for example. They are also well integrated with IDEs which can often bundle the files together and
  compare strings across languages.
- Using unique keys: developers do not like repetition in code and reusability is always the preferred approach. This
  is not true when dealing with strings. In many languages, the translation will depend on the context and having a
  single string for "yes/no" buttons will cause translation problems. It is the same across many applications, since
  most companies will use a translation memory which could cause previously translated string to apply automatically to
  strings across applications. This why we recommend a safe key pattern such as `<application-id>.<component-id>.<id>`
  where each key is unique across an application but also component (no key is re-used anywhere).

## What about URLs?

The challenge with URLs is that they are used very differently than strings and often mixed with the code itself. There
is also another problem is that since most URLs are "virtual links" you can have `/a/b` that points to a file in `/b/a`.
What does this means if we want to include this in the localization process?

1. we need to move URLs into localizable assets
2. we need to simplify supported features related to URLs to keep the solution simple

## What are URL used for?

1. SEO - maybe one of the main reason to localize URLs. To get more organic traffic, we should follow the SEO best
   practices in terms of URLs.
2. Trust - if a user sees a URL and doesn't seem to be trustworth (e.g. `somesite.com/redirect?a=2983&x=AKW82`) they
   might not use them.
3. Usability - URLs should be easy to copy/paste and point to a resource in a states that can be useful to others. This
   mean that if you have a search page with certain filters that users might want to share, the search criterias should
   ideally be persisted in the URL if we want them to be shared efficiently. This can also be good for SEO if those URLs
   are searchable.

The trust factor should be covered by using good URLs and following SEO guidelines. The usability should be kept in
mind during the implementation of different resources, which leaves us one focus: SEO.

## What are good SEO practices in terms of URLs?

Based on the [2021 research](https://backlinko.com/google-ranking-factors) from Backlinkto:

1. The shorter the URL the better.
2. Keep URL depth as low as possible (the less segments, the better)
3. Readable - the URL must be readable (stop words like a, an, or can be ommited to save length if readability is
   preserved)
4. URL strings - it's possible to add human readable strings that will show directly in Google search results using
   schema.org breadcrumbs for example.
5. Every URL should have a `title` attribute when using them in `<a>` tags

## What does this mean in terms of implementation?

In a nutshell, we should have a way to keep the URL as short as possible and associate a "description" that we can use
for multiple fields such as the `title` attribute on anchor links, the page title, the schema.org human readable
strings, etc. A scalable implementation would:

- A file that contains localizable strings matched to unique identifier
- A file that link those unique identifier to route specific configuration (e.g. path of the linked ressource)

The benefits with this approach:

- The file containing localized part of the URL supported natively localization tools.
- The actual URL configuration is independant from the strings and allows flexibility.

One thing to watch out for is keeping the configuration file under control. Ideally files should be organized
intuitively and a resource should not be used by more than one URL to avoid negative SEO impacts.

## What about dynamic URL segments?

A placeholder (dynamic URL segment) should only be usable once per URL "tree leaf" and not at the "root of the tree".
By using a placeholder at the root, it would catch all URLs which defeats the purpose of a router. Since we are using
localized URLs, dynamic URL segments should be used in specific cases:

- A number (e.g. page number in a list) - no localization required
- A unique code (e.g. email confirmation page) - no localization required
- An article "slug" - the slug should be localized and provided outside the router (e.g. API)

Validation of the value of dynamic URL segment should be done outside the router. Validation of values that would
include localizable words should be stored inside another localizable asset. This is also why routers supporting regexes
is an anti-pattern since they cannot be localized.

## What are example dynamic URL segments?

Many routers in many frameworks offer flexible ways to add variables in URLs. Since localized URL requires a linguistic
friendly integration, the supported feature must fit within that context.

### Supported Examples

**Numbers**: https://somesite.com/job-posting/page/{number}

**Unique identifier**: https://somesite.com/validate-email/{code}

```properties
custom-server-app.routes.validateEmail = Validate Email
custom-server-app.routes.validateEmailCode = {code}
```

```yaml
# Email validation page.
validateEmailCode:
  resourcePath: /validateEmail/validateEmail.page.tsx
  parent: validateEmail
  title: validateEmail # Since the default `title` would be `{code}`, we can use the title of the parent route.
```

Other related examples: password reset links, referral links

**Multiple variables**

In some cases, it is practical to have "sharable" URLs. Depending on the complexity of the parameters, the URL can
become quite long. It's up to the implementer to decide which parameter to support in the URL to provide the best user
experience.

Also, human readable segment can help SEO, for example https://somesite.com/job-posting/{city}/{role}/page/{number}

The value of those variables must be store either in the resource's strings for validation, or an API.

Also if the number of paramters becomes hard to manage, using a single variable that is a base64 encoded JSON string
can be considered.

TBD: how to get the `title`.

**Slugs**: https://somesite.com/blog/{slug}

TBD: how to get the `title`.

### Non-supported examples

**Embedded variable**: https://somesite.com/job-posting/page-{number}

Why?

To support this correctly we would need to suppurt ICU syntax at the string level. This would add a lot of complelxity
and can be consideredd at a later time.

Additionally, this would only be possible for numbers as words can cause other issues (see details below).

Solution: move the variable into its own segment.

**Words**: https://somesite.com/profile/{password|name|email}

Why?

Variable are typically protected when it comes to localization and cannot be changed by linguist. Additinally, using
non-standard syntax mixed with translation can lead to errors that can even break the router.

Solution: you can create 1 variable and put the list of available values, inside that resource's strings file. All
values must be localized and used to validate the URLs.

**Different variables on the same segment**:

```yaml
https://somesite.com/post/{identifier} # points to /post/postByIdentifier.page.tsx
https://somesite.com/post/{slug} # points to /post/postBySlug.page.tsx
```

Why?

Since variable validation (e.g. regexes) cant be localized, it's not possible too have two different variables
matching the same resource.

Solution: different parent segments

```yaml
https://somesite.com/post/identifier/{identifier} # points to /post/postByIdentifier.page.tsx
https://somesite.com/post/slug/{slug} # points to /post/postBySlug.page.tsx
```

**Optional parameter**

See reference example here: https://symfony.com/doc/current/routing.html#optional-parameters

Too complex, but could consider to support in the future.

**Priority parameter**

See reference example here: https://symfony.com/doc/current/routing.html#priority-parameter

Too complex, but could consider to support in the future.

## What are the function of a router?

1. Resolve a URL to a route
2. Get a URL from a route identifier
3. Get all available localized URLs of a given route identifier (language switcher)

Scalability challenge: we cannot load all the localized URLs of all languages of a large site as this will impact
negavitely page speed and SEO.

## How should the URL resolution work?

Other than the homepage which have special logic, the localized route resolution should only be triggered when a URL
begins with a supported BCP47 locale code. The route configuration should be usable by both the server and Next.js.

_On the server_

explain how it works on the server

- Each locale has its own index, split by URL segments (scalability can be a concern for large side and might consider
  to split even more in the future)

_On the client (Next.js)_

### to check (inject custom routes into nextjs) https://github.com/fridays/next-routes

#

#

# RAW SECTION

#

#

One problem on the other hand is that we need to keep the BCP47 code in the URL, but can all URLs have a single segment
after that? Unless you are doing a very small site, it's probably a bad idea. Having all all

2 ideas::

1 file per folder (directories.properties)
PROS: - keep simple map between folders
CONS: - dependancy with file structure - lots of files (hard to have a big picture)

1 file for all routes
PROS: - flexible (no dependancy with file structure)
CONS: - everything is in 1 file (can become hard to manage for big sites)

other ideas: remove app id and comments from a "compiled" file that would be in JSON
-- to consider capitalization of letter (e.g. which english use capital letter for headers?)

!!!!!!!! new breaking idea: 2 files (1 for string, 1 for config)
