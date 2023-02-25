## [4.2.13](https://github.com/Avansai/next-multilingual/compare/4.2.12...4.2.13) (2023-02-25)

## [4.2.12](https://github.com/Avansai/next-multilingual/compare/4.2.11...4.2.12) (2023-02-18)

## [4.2.11](https://github.com/Avansai/next-multilingual/compare/4.2.10...4.2.11) (2023-02-11)

## [4.2.10](https://github.com/Avansai/next-multilingual/compare/4.2.9...4.2.10) (2023-02-03)

## [4.2.9](https://github.com/Avansai/next-multilingual/compare/4.2.8...4.2.9) (2023-01-30)

### Reverts

- Revert `esmExternals` as it is causing build issues ([bfb5a5f](https://github.com/Avansai/next-multilingual/commit/bfb5a5fc18bb1ce4c0adea81de27b7334f70bfcd))

## [4.2.8](https://github.com/Avansai/next-multilingual/compare/4.2.7...4.2.8) (2023-01-30)

## [4.2.7](https://github.com/Avansai/next-multilingual/compare/4.2.6...4.2.7) (2023-01-29)

## [4.2.6](https://github.com/Avansai/next-multilingual/compare/4.2.5...4.2.6) (2023-01-21)

## [4.2.5](https://github.com/Avansai/next-multilingual/compare/4.2.4...4.2.5) (2023-01-15)

## [4.2.4](https://github.com/Avansai/next-multilingual/compare/4.2.3...4.2.4) (2023-01-10)

## [4.2.3](https://github.com/Avansai/next-multilingual/compare/4.2.2...4.2.3) (2022-12-31)

## [4.2.2](https://github.com/Avansai/next-multilingual/compare/4.2.1...4.2.2) (2022-12-26)

## [4.2.1](https://github.com/Avansai/next-multilingual/compare/4.2.0...4.2.1) (2022-12-19)

# [4.2.0](https://github.com/Avansai/next-multilingual/compare/4.1.0...4.2.0) (2022-12-13)

### Features

- add a `isLoading` property to `useGetLocalizedUrl` ([5e35b5d](https://github.com/Avansai/next-multilingual/commit/5e35b5dc2294d748643cd025e56ce3aa83ca428c))

### BREAKING CHANGES

- `useGetLocalizedUrl` no longer returns a function. It needs to be decomposed using `{ getLocalizedUrl }` to also support the new `isLoading` property.

# [4.1.0](https://github.com/Avansai/next-multilingual/compare/4.0.0...4.1.0) (2022-12-13)

### Features

- add the new `useGetLocalizedUrl` hook ([6f87152](https://github.com/Avansai/next-multilingual/commit/6f87152a565ae4ad9bb5cd713b58f9e5ebb3fdf3))

# [4.0.0](https://github.com/Avansai/next-multilingual/compare/3.0.13-0...4.0.0) (2022-12-13)

### Bug Fixes

- fix `TypeError: Cannot read properties of undefined (reading '__rewrites')` ([dd688ee](https://github.com/Avansai/next-multilingual/commit/dd688eed402bb0c8d415dbc683eef89d3cfa051b))
- fix incorrect handling of casing in dynamic route parameters ([36af5f1](https://github.com/Avansai/next-multilingual/commit/36af5f1e9f34edc44e6905ad165a022630fe0702))

### BREAKING CHANGES

- `getLocalizedUrl` is now `async` to avoid triggering a rare error (`TypeError: Cannot read properties of undefined (reading '__rewrites')`) because of how Next.js works.. This only occurred when performing fast operations on the site and was amplified while upgrading to Cypress 12 which seems to be much faster at running tests.

## [3.0.12](https://github.com/Avansai/next-multilingual/compare/3.0.12-1...3.0.12) (2022-12-07)

### Bug Fixes

- Fix Watchpack errors that could occur in large projects ([d0a6aa6](https://github.com/Avansai/next-multilingual/commit/d0a6aa6ffaeb7db935ad1d68963c4ea892fb277a))

## [3.0.11](https://github.com/Avansai/next-multilingual/compare/3.0.11-0...3.0.11) (2022-12-07)

### Performance Improvements

- cache `useMessage` to make it more performant ([e3996b1](https://github.com/Avansai/next-multilingual/commit/e3996b115080596f57759d66280d939f2fe2afb8))

## [3.0.10](https://github.com/Avansai/next-multilingual/compare/3.0.10-2...3.0.10) (2022-12-06)

### Bug Fixes

- fix a routing issue where localized dynamic routes would intercept static routes ([4cc82c6](https://github.com/Avansai/next-multilingual/commit/4cc82c66b61426b1760dc6130047a24a0ae33c66))
- fix an issue where redirects would have the wrong casing for localized dynamic route parameters ([73dccf2](https://github.com/Avansai/next-multilingual/commit/73dccf254c700fb6c0d128d841ca09c31a63e6d9))

## [3.0.9](https://github.com/Avansai/next-multilingual/compare/3.0.8...3.0.9) (2022-12-04)

## [3.0.8](https://github.com/Avansai/next-multilingual/compare/3.0.7...3.0.8) (2022-11-28)

## [3.0.5-3.0.7](https://github.com/Avansai/next-multilingual/compare/3.0.4...3.0.7) (2022-11-18)

### Bug Fixes

- fix internal server errors on the homepage when deploying on Vercel and Netlify

## [3.0.4](https://github.com/Avansai/next-multilingual/compare/3.0.3...3.0.4) (2022-11-13)

## [3.0.3](https://github.com/Avansai/next-multilingual/compare/3.0.2...3.0.3) (2022-11-06)

## [3.0.2](https://github.com/Avansai/next-multilingual/compare/3.0.1...3.0.2) (2022-11-04)

### Features

- add `ref` support on our `Link` component. This will enable using the `as={Link}` on many popular UI frameworks following the Next.js 13 `Link` breaking change ([8400b5b](https://github.com/Avansai/next-multilingual/commit/8400b5b3fdfd21b0c4d58514285f9214ff414f98))

## [3.0.1](https://github.com/Avansai/next-multilingual/compare/3.0.0...3.0.1) (2022-10-31)

### Bug Fixes

- preserve casing for dynamic route parameter names ([9f43bcd](https://github.com/Avansai/next-multilingual/commit/9f43bcd5139766e63acc4fcd5a4883072c3ea1a0))

# [3.0.0](https://github.com/Avansai/next-multilingual/compare/2.0.4...3.0.0) (2022-10-27)

### Features

- add catch-all dynamic route support ([668ba1d](https://github.com/Avansai/next-multilingual/commit/668ba1de2696c0256b83e93319e3c0423e409d47))

### BREAKING CHANGES

- The configuration now requires a new `defaultLocale` parameter (it used to be implicit).
- `getHtmlLang` now takes a `DocumentProps` object as an argument to better align with functional components.
- `getLocalizedRouteParameters` takes new parameter: `import.meta.url`
  - `<Link>`, `useLocalizedUrl`, `getLocalizedUrl` no longer allow `UrlObject` to be passed in argument. Only strings are supported to simplify the API types. `UrlObject.href` can easily be used instead of passing the object directly. - `useRouter().query` is no longer used to pass dynamic route parameters. Full URLs should be provided instead.
- `useLocalizedUrl` and `getLocalizedUrl` have a new 3rd parameter: `localizedRouteParameters` - meaning the existing parameters will shift by 1 position.
- `slugify`'s `locale` argument is now mandatory.

## [2.0.4](https://github.com/Avansai/next-multilingual/compare/2.0.3...2.0.4) (2022-10-13)

## [2.0.3](https://github.com/Avansai/next-multilingual/compare/2.0.2...2.0.3) (2022-10-09)

## [2.0.2](https://github.com/Avansai/next-multilingual/compare/2.0.1...2.0.2) (2022-10-03)

## [2.0.1](https://github.com/Avansai/next-multilingual/compare/2.0.0...2.0.1) (2022-09-25)

# [2.0.0](https://github.com/Avansai/next-multilingual/compare/1.5.0...2.0.0) (2022-09-18)

### Features

- simplified APIs to access locale values ([ac2dcb3](https://github.com/Avansai/next-multilingual/commit/ac2dcb3f69674f11e1fdcca3793874ac4cd26be4))

### BREAKING CHANGES

- replaced the first few `getLocalizedRouteParameters` arguments to take directly the `getStaticProps` or `getServerSideProps` contexts.
- `useRouter` will now return the locales used by `next-multilingual` instead of those used by Next.js:
  - `getActualLocale`, `getActualLocales` and `getActualDefaultLocale` should not longer be required
- replacing `MultilingualStaticProps` by `getStaticPropsLocales`
- replacing `MultilingualServerSideProps` by `getServerSidePropsLocales`

# [1.5.0](https://github.com/Avansai/next-multilingual/compare/1.4.2...1.5.0) (2022-09-15)

### Features

- support localized dynamic route ([159e0b2](https://github.com/Avansai/next-multilingual/commit/159e0b26b44bf8dc3eeef442f6bbcf9cee0b0794))
- support the `..` syntax in localized URL APIs ([bad63d5](https://github.com/Avansai/next-multilingual/commit/bad63d5db248f60d56796aff775a4338b9d34834))

### BREAKING CHANGES

- Move `useRouter` to `next-multilingual/router`
- Dynamic routes no longer works without using `getLocalizedRouteParameters`

## [1.4.2](https://github.com/Avansai/next-multilingual/compare/1.4.1...1.4.2) (2022-08-23)

## [1.4.1](https://github.com/Avansai/next-multilingual/compare/1.4.0...1.4.1) (2022-08-17)

### Features

- add the new `MultilingualServerSideProps` & `MultilingualStaticProps` types ([4351938](https://github.com/Avansai/next-multilingual/commit/43519380313ebf32b929224b536d1e922939e25b))

# [1.4.0](https://github.com/Avansai/next-multilingual/compare/1.3.0...1.4.0) (2022-08-14)

### Bug Fixes

- missing argument while deleting the locale cookie ([344adf5](https://github.com/Avansai/next-multilingual/commit/344adf52f43af056b7ac73608ac0bd5931f8ebc8))

### Features

- add new argument to `useActualLocale` to simplify integration and a new `resolveLocale` API ([93b1c8e](https://github.com/Avansai/next-multilingual/commit/93b1c8ee12ad9f328249379d1875e93b4672babf))

# [1.3.0](https://github.com/Avansai/next-multilingual/compare/1.2.1...1.3.0) (2022-08-14)

### Features

- add new hooks and APIs to simplify integration (details in [README](./README.md)):

  - `useActualLocale`: used in `_app` for smart locale detection. ([99d10b4](https://github.com/Avansai/next-multilingual/commit/99d10b44b0f1de97ac72543a3dae063f74cd6eaf))
  - `useResolvedLocale`: used in the homepage for smart locale detection. ([abadb36](https://github.com/Avansai/next-multilingual/commit/abadb362a092582f39eb798b5d0e5a20ce03aede))
  - `getHtmlLang`: used in `_document` to get the `html` tag `lang` attribute value ([99d10b4](https://github.com/Avansai/next-multilingual/commit/99d10b44b0f1de97ac72543a3dae063f74cd6eaf))
  - `useRouter`: wrapper on top of Next.js' to avoid `undefined` types on locale properties (they are never `undefined` with `next-multilingual`) ([99d10b4](https://github.com/Avansai/next-multilingual/commit/99d10b44b0f1de97ac72543a3dae063f74cd6eaf))

### Performance Improvements

- optimize `useRouter` with a `useMemo` ([fde5af0](https://github.com/Avansai/next-multilingual/commit/fde5af021073173b1acdbd5931be1d8a0ecb6d92))
- fix `locales must be configured in Next.js` error being thrown during other unrelated Internal Server Errors. ([99d10b4](https://github.com/Avansai/next-multilingual/commit/99d10b44b0f1de97ac72543a3dae063f74cd6eaf))

## [1.2.1](https://github.com/Avansai/next-multilingual/compare/1.2.0...1.2.1) (2022-08-12)

### Features

- support directories for `404` and `500` error pages ([1564860](https://github.com/Avansai/next-multilingual/commit/15648607e8954fa6741914028d4346acc6ea7725))

# [1.2.0](https://github.com/Avansai/next-multilingual/compare/1.1.2...1.2.0) (2022-08-12)

### Code Refactoring

- add `eslint-plugin-unicorn` to help increase code quality ([3f109e4](https://github.com/Avansai/next-multilingual/commit/3f109e4fd5e42b518826781ee1d2d4a472f524ba))

### Features

- support `export from` syntax for shared messages ([d78a846](https://github.com/Avansai/next-multilingual/commit/d78a8467dc5a0ba28174d0244a19ae1d5c473be8))

### BREAKING CHANGES

- Using the `node:` scheme to better identify Node.js modules requires advanced config users to extend the new `webpackConfigurationHandler` (see README for details)

## [1.1.2](https://github.com/Avansai/next-multilingual/compare/1.1.1...1.1.2) (2022-08-01)

### Bug Fixes

- fix ESLint `exports` import resolver issue ([61048e3](https://github.com/Avansai/next-multilingual/commit/61048e3880b7e1b0bfc826d8a7915492a8482afb))
- fix ESLint issues ([5056cb9](https://github.com/Avansai/next-multilingual/commit/5056cb9b84a19de0d7ce827f36b0f8cf7a8d8ea6))
- remove non-standard Apple character ([8cfd32a](https://github.com/Avansai/next-multilingual/commit/8cfd32ab4863977cbec8f168c612905e8a5de89a))

## [1.1.1](https://github.com/Avansai/next-multilingual/compare/1.1.0...1.1.1) (2022-07-25)

# [1.1.0](https://github.com/Avansai/next-multilingual/compare/1.0.7...1.1.0) (2022-07-25)

### Code Refactoring

- use the new `messages-modules` package to generate the Babel plugin ([127caad](https://github.com/Avansai/next-multilingual/commit/127caad586bbc56a44f0a158348b716a90b5cfc1))

### BREAKING CHANGES

- namespace imports (`import * as messages from 'next-multilingual/messages'`) of `useMessages` and `getMessages` are no longer be supported

## [1.0.7](https://github.com/Avansai/next-multilingual/compare/1.0.6...1.0.7) (2022-07-23)

## [1.0.6](https://github.com/Avansai/next-multilingual/compare/1.0.5...1.0.6) (2022-07-17)

## [1.0.5](https://github.com/Avansai/next-multilingual/compare/1.0.4...1.0.5) (2022-07-11)

### Features

- add new `exists` method on `messages` ([b16babc](https://github.com/Avansai/next-multilingual/commit/b16babc1055804a2135c97fca9295b30dbeafeba))

## [1.0.4](https://github.com/Avansai/next-multilingual/compare/1.0.3...1.0.4) (2022-07-10)

### Bug Fixes

- fix a bug that did prevented automatic content refresh during development for `.ts` files ([80e0ae9](https://github.com/Avansai/next-multilingual/commit/80e0ae932e3c2dcf6afffef7a166986352bc38db))

## [1.0.3](https://github.com/Avansai/next-multilingual/compare/1.0.2...1.0.3) (2022-07-03)

## [1.0.2](https://github.com/Avansai/next-multilingual/compare/1.0.1...1.0.2) (2022-06-30)

## [1.0.1](https://github.com/Avansai/next-multilingual/compare/1.0.0...1.0.1) (2022-06-18)

# [1.0.0](https://github.com/Avansai/next-multilingual/compare/0.12.0...1.0.0) (2022-06-13)

🎉 After almost a year of development, we consider our APIs mature enough to release version 1.

### Features

- add key collision detection in .properties files ([6c37ada](https://github.com/Avansai/next-multilingual/commit/6c37ada6a8b6612e8a8b20682c9e59f62749bd0b))

# [0.12.0](https://github.com/Avansai/next-multilingual/compare/0.11.2...0.12.0) (2022-06-04)

### Bug Fixes

- apply LightHouse recommendations to improve the example's score ([5ac3c3c](https://github.com/Avansai/next-multilingual/commit/5ac3c3c49e606fb6463d9dcaab64ea1dd9940c8d))
- remove generic `JSX.Element` type on `Head` and `Link` components ([b4aafda](https://github.com/Avansai/next-multilingual/commit/b4aafda996755fb5bec3af896c185e5a8f2205ce))

### BREAKING CHANGES

- This change should be backward compatible but there is a slight risk of breaking certain implementations since the return type is changing.

## [0.11.2](https://github.com/Avansai/next-multilingual/compare/0.11.1...0.11.2) (2022-06-04)

### Bug Fixes

- use localized URL instead of the default locale for canonical links ([a4e98b8](https://github.com/Avansai/next-multilingual/commit/a4e98b828ff4c438c878aeba2b4615a9f79cd8d0))

## [0.11.1](https://github.com/Avansai/next-multilingual/compare/0.11.0...0.11.1) (2022-05-14)

### Features

- replicate Next.js' behavior with trailing slashes in URLs ([fe98515](https://github.com/Avansai/next-multilingual/commit/fe9851532bdce5098dad1d1c361e171855344a52))

# [0.11.0](https://github.com/Avansai/next-multilingual/compare/0.10.4...0.11.0) (2022-04-25)

### Bug Fixes

- **example:** abort API calls when switching language on the example's homepage ([bf1e658](https://github.com/Avansai/next-multilingual/commit/bf1e65867cbfed54a9083478fcabc59f61762ff8))

### Features

- add `basePath` support and new `getLocalizedUrl` API ([fb7f9cf](https://github.com/Avansai/next-multilingual/commit/fb7f9cf1544164fc635809ca1ef6dad1677b6ac5))

### BREAKING CHANGES

- `useLocalizedUrl` was moved from `next-multilingual/link` to `next-multilingual/url`

## [0.10.4](https://github.com/Avansai/next-multilingual/compare/0.10.3...0.10.4) (2022-03-14)

### Features

- **link:** add support for absolute URLs in the `link` component ([90cabc2](https://github.com/Avansai/next-multilingual/commit/90cabc240c1d9007524fc8121667c7c1830d687a))## [0.10.3](https://github.com/Avansai/next-multilingual/compare/0.10.2...0.10.3) (2022-02-07)

## [0.10.3](https://github.com/Avansai/next-multilingual/compare/0.10.2...0.10.3) (2022-02-06)

### Features

- **link:** add localized anchor links support ([6b1351f](https://github.com/Avansai/next-multilingual/commit/6b1351f7b9ce4e13e4d3a7cc18d9c037ab5bcbb1))

## [0.10.2](https://github.com/Avansai/next-multilingual/compare/0.10.1...0.10.2) (2022-01-26)

### Bug Fixes

- re-export `Message` and `Messages` classes to be usable as types ([690e41f](https://github.com/Avansai/next-multilingual/commit/690e41f8eca05390b21d200e7b221a79c7409e9e))

## [0.10.1](https://github.com/Avansai/next-multilingual/compare/0.10.0...0.10.1) (2022-01-26)

### Bug Fixes

- downgrade to Node.js 14 for Vercel support ([f4cf125](https://github.com/Avansai/next-multilingual/commit/f4cf125ac9057d3d5838d260f655b5124527bf6d))

# [0.10.0](https://github.com/Avansai/next-multilingual/compare/0.9.7...0.10.0) (2022-01-25)

### Features

- **inline-jsx:** complete the inline-jsx feature including tests and documentation ([855c8af](https://github.com/Avansai/next-multilingual/commit/855c8af8e3ddc8952f2da90a2e8c17dd202b5898))
- **encoding:** support optional BOM characters of `.properties` file ([e9e79ab](https://github.com/Avansai/next-multilingual/commit/e9e79abe48fcff3182f30c9f02aafa2bfd06a1c6))

## [0.9.7](https://github.com/Avansai/next-multilingual/compare/0.9.6...0.9.7) (2022-01-06)

### Bug Fixes

- **SSR:** disable `esmExternals` until we support ES modules to fix localized URLs SSR markup ([26ddb22](https://github.com/Avansai/next-multilingual/commit/26ddb22c2b489064b9520e1b7cba015bab5f8a0e))

## [0.9.6](https://github.com/Avansai/next-multilingual/compare/0.9.5...0.9.6) (2022-01-05)

### Bug Fixes

- **SSR:** replace Chokidar with CheapWatch ([e5a1951](https://github.com/Avansai/next-multilingual/commit/e5a19518f0d84d8eb1c1a624192d8eb5af1b78cf))

## [0.9.5](https://github.com/Avansai/next-multilingual/compare/0.9.4...0.9.5) (2022-01-05)

### Features

- **debug:** add new debug option for advanced configuration ([33f4320](https://github.com/Avansai/next-multilingual/commit/33f43206c064764f7119478f7308d19ee6c2db35))

## [0.9.4](https://github.com/Avansai/next-multilingual/compare/0.9.3...0.9.4) (2022-01-05)

## [0.9.3](https://github.com/Avansai/next-multilingual/compare/0.9.2...0.9.3) (2022-01-04)

### Bug Fixes

- **test:** add test for builds and fix failing tests ([c493655](https://github.com/Avansai/next-multilingual/commit/c493655fa123a6a05137bc9e4bbf29534391a42a))

## [0.9.2](https://github.com/Avansai/next-multilingual/compare/0.9.1...0.9.2) (2022-01-04)

### Bug Fixes

- `TypeError: Cannot read properties of undefined (reading '__rewrites')` ([ee2a5e4](https://github.com/Avansai/next-multilingual/commit/ee2a5e469a33dea7a19519f8d4c441a3494d0903))

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
