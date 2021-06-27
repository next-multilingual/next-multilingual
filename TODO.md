# Things to do

To make tracking of to-dos easier, this file can be used to track progress on the overall maturity of the package.

### To-do

- [ ] Add strings key prefix support (`next-multilingual/properties-loader` ?)
- [ ] Add built-in cookie manager to make integration easier (`next-multilingual/cookie` ?)
- [ ] Check if we need this route: /en-us/homepage -> /en-us
- [ ] Check if we can add `title` attributes on `Link` components (not supported by Next.js?)
- [ ] Add browser side cookie to persist selected locale on initial page load
- [ ] Localized error pages
- [ ] Add automated test:
  - [ ] Test when a string file changes, the page is updated (developer experience?)
  - [ ] Test language detection
  - [ ] Test Header
  - [ ] Test links
  - [ ] Test for: http://localhost:3000/mul/about-us
  - [ ] Test for: http://localhost:3000/about-us
  - [ ] Test with a 3rd language (language switch hydration issues?)
- [ ] In the `config` API, gracefully merge options passed in argument as an object instead of overwriting
- [ ] In the `config` API, support options passed functions (see Next.js doc)

### In Progress

- [ ] Redo an easier readme based on an end-to-end configuration
- [ ] Fix contact-us pages (add localized strings and CSS)
- [ ] Understand/tweak/document `MulHead`
    - [ ] Canonical links?

### Done ✓

- [x] Test/learn/refactor alternate links
    - [x] Cleanup extra `x-default` links?
- [x] Test browsing of non-localized URLs
- [x] Fix bug when / SSR lang on HTML tag is wrong
- [x] Understand/tweak/document `MulLink`
- [x] Understand/tweak/document `MulRouter`
- [x] Fix console error when loading non-english pages: Warning: Prop `href` did not match. Server: "/fr-ca/%C3%A0-propos-de-nous" Client: "/fr-ca/about-us"s
- [x] Fix `npm run build`

