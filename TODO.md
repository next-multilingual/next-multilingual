# Things to do

To make tracking of to-dos easier, this file can be used to track progress on the overall maturity of the package.

### To-do 📝

- Add ICU support in `useMessage`
- Localized error pages
- Test in Vercel prod
- Test dynamic routes (with placeholders)
- Test `useMessages` with APIs
- HTML inside properties files (as JSX)
- Check if we can add `title` attributes on `Link` components (not supported by Next.js?)
- Add automated test:
  - Test when a string file changes, the page is updated (developer experience?)
  - Test language detection
  - Test Header
  - Test links
  - Test for: http://localhost:3000/mul/about-us
  - Test for: http://localhost:3000/about-us
  - Test with a 3rd language (language switcher hydration issues?)
  - Test fallback to default locale
- Automatically restart Next.js if `pageTitle` changes
- In the `config` API, gracefully merge options passed in argument as an object instead of overwriting
- In the `config` API, support options passed functions (see Next.js doc)
- Try Javascript support?
- Try strict mode
- sitemap
- Add other docs: contribution, design doc, etc.

### In Progress 🚧

- Implement default locale fallback with warning messages
- English (en-US) titles are not used in routes (e.g. contact-us2) -> need to implement this if we want non-english default locale
- Update readme (in messages) for `properties` files, unique keys, etc.
- Redo an easier readme based on an end-to-end configuration

### Done ✔️

- Check if we need this route: /en-us/homepage -> /en-us
- Automatically rebuild when modifying a properties file
- Add key suffix to all file and exclude them in `useMessages`
- Test new Babel plugin modular string loader
- Fix contact-us pages (add localized strings and CSS)
- Add license doc
- Add browser side cookie to persist selected locale on initial page load
- move `nookies` to  `next-multilingual` -> `getCookieLocale`
- move `resolve-accept-language` to  `next-multilingual` -> `getPreferredLocale`
- add `next-multilingual/properties` to avoid the extra Webpack loader dependency
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

