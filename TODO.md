# Things to do

To make tracking of to-dos easier, this file can be used to track progress on the overall maturity of the package.

### To-do

- [ ] Check if we need this route: /en-us/homepage -> /en-us
- [ ] Check if we can add `title` attributes on `Link` components (not supported by Next.js?)
- [ ] Add strings key prefix support (`next-multilingual/properties-loader` ?)
- [ ] Localized error pages
- [ ] Add automated test:
  - [ ] Test language detection
  - [ ] Test Header
  - [ ] Test links
  - [ ] Test for: http://localhost:3000/mul/about-us
  - [ ] Test for: http://localhost:3000/about-us

### In Progress

- [ ] Test browsing of non-localized URLs
- [ ] Fix contact-us pages (add localized strings and CSS)
    - [ ] Fix `npm run build`
- [ ] Understand/tweak/document `MulHead`
    - [ ] Canonical links?
    - [ ] Cleanup extra `x-default` links?

### Done ✓

- [x] Understand/tweak/document `MulLink`
- [x] Understand/tweak/document `MulRouter`
