# Things to do

To make tracking of to-dos easier, this file can be used to track progress on the overall maturity of the package.

### To-do 📝

- Add naming best practice for message key in documentation
- Refactor 'identifier' to 'id' to make code less verbose
- Export/import CLI
- Profiling, package size optimization (e.g. intl-messageformat strip down)
- Test dynamic routes (with placeholders)
- HTML inside properties files (as JSX)
- - bug: the Babel plugin does not check if an hijack target (import) is used before injecting. This cause the import to be removed for optimization and cause a 500 error when trying to inject the non-existing import.
- Check if we can add `title` attributes on `Link` components (not supported by Next.js?) (ref: https://backlinko.com/google-ranking-factors)
- Add automated test:
  - Test when a string file changes, the page is updated (developer experience?)
  - Test language detection
  - Test Header
  - Test links
  - Test for: http://localhost:3000/mul/about-us
  - Test for: http://localhost:3000/about-us
  - Test with a 3rd language (language switcher hydration issues?)
  - Test fallback to default locale
- In the `config` API, gracefully merge options passed in argument as an object instead of overwriting
- In the `config` API, support options passed functions (see Next.js doc)
- Try Javascript support?
- Automatically restart Next.js routes changes (e.g. use `forever`)
- Default locale fallback
- Lorem ipsum generator?
- Try strict mode
- Sitemap
- schema.org markup support (e.g. breadcrumbs)

### In Progress 🚧

- Support Next.js APIs
- Test anchor links (including translation and doc)

### Done ✔️

- Bug: intermittent 500 internal server error when using the API
- Change minimum 3 char key too 1 char
- Remove erroneous API warning
- Make separation between `slug` and `title`
- Make it work with Netlify (looks like their Next.js script does not support our configs)
- Add other docs: contribution, design doc, etc.
- Make it work on Vercel (https://github.com/vercel/vercel/discussions/6710)
- Demo app is up on
- Add ICU support in `useMessage`
- Localized error pages
- Launch our beta npm package
- Shared message
- Redo an easier readme based on an end-to-end configuration
- Log warnings when a route changes (warn about restart)
- Log easy to fix warnings when messages are missing
- English (en-US) titles are not used in routes (e.g. contact-us2) -> need to implement this if we want non-english default locale
- Check if we need this route: /en-us/homepage -> /en-us
- Automatically rebuild when modifying a properties file
- Add key suffix to all file and exclude them in `useMessages`
- Test new Babel plugin modular string loader
- Fix contact-us pages (add localized strings and CSS)
- Add license doc
- Add browser side cookie to persist selected locale on initial page load
- Move `nookies` to `next-multilingual` -> `getCookieLocale`
- Move `resolve-accept-language` to `next-multilingual` -> `getPreferredLocale`
- Add `next-multilingual/properties` to avoid the extra Webpack loader dependency
- Understand/tweak/document `MulHead`
  - Canonical links?
- Test/learn/refactor alternate links
  - Cleanup extra `x-default` links?
- Test browsing of non-localized URLs
- Fix bug when / SSR lang on HTML tag is wrong
- Understand/tweak/document `MulLink`
- Understand/tweak/document `MulRouter`
- Fix console error when loading non-english pages: Warning: Prop `href` did not match. Server: "/fr-ca/%C3%A0-propos-de-nous" Client: "/fr-ca/about-us"s
- Fix `npm run build`
