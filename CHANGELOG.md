## [0.9.7](https://github.com/Avansai/next-multilingual/compare/0.9.6...0.9.7) (2022-01-06)


### Bug Fixes

* **SSR:** disable `esmExternals` until we support ES modules to fix localized URLs SSR markup ([26ddb22](https://github.com/Avansai/next-multilingual/commit/26ddb22c2b489064b9520e1b7cba015bab5f8a0e))

## [0.9.6](https://github.com/Avansai/next-multilingual/compare/0.9.5...0.9.6) (2022-01-05)


### Bug Fixes

* **SSR:** replace Chokidar with CheapWatch ([e5a1951](https://github.com/Avansai/next-multilingual/commit/e5a19518f0d84d8eb1c1a624192d8eb5af1b78cf))

## [0.9.5](https://github.com/Avansai/next-multilingual/compare/0.9.4...0.9.5) (2022-01-05)


### Features

* **debug:** add new debug option for advanced configuration ([33f4320](https://github.com/Avansai/next-multilingual/commit/33f43206c064764f7119478f7308d19ee6c2db35))

## [0.9.4](https://github.com/Avansai/next-multilingual/compare/0.9.3...0.9.4) (2022-01-05)

## [0.9.3](https://github.com/Avansai/next-multilingual/compare/0.9.2...0.9.3) (2022-01-04)


### Bug Fixes

* **test:** add test for builds and fix failing tests ([c493655](https://github.com/Avansai/next-multilingual/commit/c493655fa123a6a05137bc9e4bbf29534391a42a))

## [0.9.2](https://github.com/Avansai/next-multilingual/compare/0.9.1...0.9.2) (2022-01-04)


### Bug Fixes

* `TypeError: Cannot read properties of undefined (reading '__rewrites')` ([ee2a5e4](https://github.com/Avansai/next-multilingual/commit/ee2a5e469a33dea7a19519f8d4c441a3494d0903))

## [0.9.1](https://github.com/Avansai/next-multilingual/compare/0.9.0...0.9.1) (2022-01-04)

# [0.9.0](https://github.com/Avansai/next-multilingual/compare/0.8.4...0.9.0) (2021-12-27)

### Bug Fixes

- **cookies:** fix `SameSite` warning on cookies ([28f6403](https://github.com/Avansai/next-multilingual/commit/28f64039a0977e67ca7c198ae2336ac506e54b93))
- **favicon:** fix missing favicon browser warnings ([871f87d](https://github.com/Avansai/next-multilingual/commit/871f87dfb30a6845f33017585d34c569718cf6d9))
- **head:** normalize locale capitalization in HTML attributes ([269cab9](https://github.com/Avansai/next-multilingual/commit/269cab9daff47dfdbd08067572fe7b2625206af0))
- **ssr:** fix an issue where the server would be desynchronized with the client ([777a719](https://github.com/Avansai/next-multilingual/commit/777a7197c6ce94f9f3e9a99eb45f71b4f5d976c0))
- **urls:** make localized dynamic routes work ([7c185bd](https://github.com/Avansai/next-multilingual/commit/7c185bdba33445f0c0aae134839cf89e441cc8eb))

### Features

- **urls:** add new hook `useLocalizedUrl` to enable localized URLs outside of the `<Link>` component ([b759923](https://github.com/Avansai/next-multilingual/commit/b7599232eb9d9b61ef6b900bb515d7903cb8aa6a))
- **tests:** add automated Cypress tests ([fb1bd95](https://github.com/Avansai/next-multilingual/commit/fb1bd95e79d08eaa402f72e4a8a76ea9e976198f))
- **encoding:** add warnings when file encoding issues are detected ([4c21b0a](https://github.com/Avansai/next-multilingual/commit/4c21b0a19a33f2c3f5ec8dd90cc89891f60333b3))

## [0.8.4](https://github.com/Avansai/next-multilingual/compare/0.8.3...0.8.4) (2021-11-28)

- 🐛 fix NEXT_PUBLIC_ORIGIN trailing slash bug ([493b96c](https://github.com/Avansai/next-multilingual/commit/493b96ce7d3af8c50fe3458c17743cdb728cd39a))

## [0.8.3](https://github.com/Avansai/next-multilingual/compare/0.8.2...0.8.3) (2021-11-28)

- 🐛 fix NEXT_PUBLIC_ORIGIN trailing slash bug ([8a8cb07](https://github.com/Avansai/next-multilingual/commit/8a8cb075cf3427a9b8a6631ebbd8eb41472b3c68))

## [0.8.2](https://github.com/Avansai/next-multilingual/compare/0.8.1...0.8.2) (2021-11-28)

- 🐛 fix 0.8.1 client-side non-localized URLs bug ([2ff53e2](https://github.com/Avansai/next-multilingual/commit/2ff53e279cb5ba108d30bc5581b32964d5b597e3))

## [0.8.1](https://github.com/Avansai/next-multilingual/compare/0.8.0...0.8.1) (2021-11-27)

- 🐛 fix non-localized SSR URLs in `<Head>` ([841669a](https://github.com/Avansai/next-multilingual/commit/841669a65a033753f525afc538a1d87beab1fc29))

# [0.8.0](https://github.com/Avansai/next-multilingual/compare/0.7.4...0.8.0) (2021-11-21)

- 💥 breaking change - rename core APIs: `MulConfig` -> `Config`, `getMulConfig` -> `getConfig`, `MulLink` -> `Link`, `MulHead` -> `Head` ([47a1c7c](https://github.com/Avansai/next-multilingual/commit/47a1c7c7824da5e9bb04e6c2524dd2d3723296b4))
- 🐛 revert change introduced in 0.7.4 to correctly hydrate dynamic route links

## [0.7.4](https://github.com/Avansai/next-multilingual/compare/0.7.3...0.7.4) (2021-11-15)

## [0.7.3](https://github.com/Avansai/next-multilingual/compare/0.7.2...0.7.3) (2021-11-15)

- ✨ added dynamic routes support

## [0.7.2](https://github.com/Avansai/next-multilingual/compare/0.7.1...0.7.2) (2021-10-31)

## [0.7.1](https://github.com/Avansai/next-multilingual/compare/0.7.0...0.7.1) (2021-10-31)

# [0.7.0](https://github.com/Avansai/next-multilingual/compare/0.6.0...0.7.0) (2021-10-28)

- 💥 breaking change - the `slugKeyId` parameter has been removed from `MulConfig` to keep the overall solution simpler ([4a8a805](https://github.com/Avansai/next-multilingual/commit/4a8a8052ffb68339c4de09ebac1c407a28eaaa5c))

# [0.6.0](https://github.com/Avansai/next-multilingual/compare/0.5.0...0.6.0) (2021-10-27)

- 💥 breaking change - refactoring the `getTitle` to return a string instead of a `Message` object ([9283a67](https://github.com/Avansai/next-multilingual/commit/9283a672bb34ff083f031df5dbb10797981ae9e0))
- ⚡️ increased performance of `messages.format()`

# [0.5.0](https://github.com/Avansai/next-multilingual/compare/0.4.1...0.5.0) (2021-10-25)

- ✨ added `getMessages` to support localized Next.js API Routes

## [0.4.1](https://github.com/Avansai/next-multilingual/compare/0.4.0...0.4.1) (2021-10-20)

# [0.4.0](https://github.com/Avansai/next-multilingual/compare/0.3.2...0.4.0) (2021-10-18)

- 💥 breaking change - renaming the `pageTitle` message key by `slug` for localized URLs ([6082034](https://github.com/Avansai/next-multilingual/commit/6082034eed7fb21f87dfbe9b062277b911a0191))

## [0.3.2](https://github.com/Avansai/next-multilingual/compare/0.3.1...0.3.2) (2021-09-25)

## [0.3.1](https://github.com/Avansai/next-multilingual/compare/0.3.0...0.3.1) (2021-09-24)

# [0.3.0](https://github.com/Avansai/next-multilingual/compare/0.2.0...0.3.0) (2021-09-18)

# [0.2.0](https://github.com/Avansai/next-multilingual/compare/0.1.5...0.2.0) (2021-09-12)

## [0.1.5](https://github.com/Avansai/next-multilingual/compare/0.1.4...0.1.5) (2021-09-07)

## [0.1.4](https://github.com/Avansai/next-multilingual/compare/0.1.3...0.1.4) (2021-09-06)

## [0.1.3](https://github.com/Avansai/next-multilingual/compare/0.1.2...0.1.3) (2021-09-06)

## [0.1.2](https://github.com/Avansai/next-multilingual/compare/0.1.1...0.1.2) (2021-09-01)

## 0.1.1 (2021-08-28)

- update dependencies ([b9f59cd](https://github.com/Avansai/next-multilingual/commit/b9f59cdcc613d1029becae6cc0b129557207834f))

## 0.1.0 Initial release (2021-08-28)

- localized URLs supporting UTF-8 characters
- locale prefix for all locales, including the default locale
- dynamic localized display on `/` without the need of redirection
- `useMessages()` hook to access local scope messages
- `<MulHead>` component generating canonical and alternate links HTML markup
