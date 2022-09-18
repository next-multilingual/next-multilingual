import { cyanBright } from 'colorette'
import type {
  GetServerSidePropsContext,
  GetStaticPathsContext,
  GetStaticPropsContext,
  PreviewData,
} from 'next'
import * as nextLog from 'next/dist/build/output/log'
import Document from 'next/document'
import { useRouter } from 'next/router'
import { sep as pathSeparator } from 'node:path'
import { ParsedUrlQuery } from 'node:querystring'
import Cookies from 'nookies'
import { useEffect } from 'react'
import resolveAcceptLanguage from 'resolve-accept-language'

/**
 * Wrapper in front of Next.js' log to only show messages in non-production environments.
 *
 * To avoid exposing sensitive data (e.g., server paths) to the clients, we only display logs in non-production environments.
 */
export const log = {
  /**
   * Log a warning message in the console(s) to non-production environments.
   *
   * @param message - The warning message to log.
   */
  warn(message: string): void {
    if (process.env.NODE_ENV !== 'production') {
      nextLog.warn(message)
    }
  },
}

/**
 * Highlight a segment of a log message.
 *
 * @param segment - A segment of a log message.
 *
 * @returns The highlighted segment of a log message.
 */
export function highlight(segment: string): string {
  return cyanBright(segment)
}

/**
 * Highlight a file path segment of a log message, normalized with the current file system path separator
 *
 * @param filePath - A file path segment of a log message.
 *
 * @returns The highlighted file path segment of a log message.
 */
export function highlightFilePath(filePath: string): string {
  return highlight(pathSeparator !== '/' ? filePath.replace(/\//g, pathSeparator) : filePath)
}

/**
 * The locales state that includes both the current locale and the locales configuration.
 */
export type LocalesState = LocalesConfig & {
  /** The current locale. */
  readonly locale: string
}

/**
 * The Next.js locales state that includes both the current locale and the locales configuration.
 */
export type NextLocalesState = Partial<LocalesState>

/**
 * The locale configuration.
 */
export type LocalesConfig = {
  /** The supported locales. */
  readonly locales: string[]
  /** The default locale. */
  readonly defaultLocale: string
}

/**
 * The Next.js locales configuration.
 */
export type NextLocalesConfig = Partial<LocalesConfig>

/**
 * Get the Next.js locales state.
 *
 * There are edge cases (e.g. Internal Server Errors) where `defaultLocale` and `locale` are `undefined`. This
 * API will ensure that no locales details are left `undefined`.
 *
 * @param rawLocalesState - The "raw" Next.js locales state.
 *
 * @returns The Next.js locale state without `undefined` values.
 */
export function getNextLocalesState(rawLocalesState: NextLocalesState): LocalesState {
  const { locale, locales, defaultLocale } = rawLocalesState
  if (locales === undefined) {
    throw new Error('locales must be configured in Next.js')
  }

  return {
    locale: locale ?? locales[1], // Fallback on the actual default locale.
    locales,
    defaultLocale: defaultLocale ?? locales[0], // Fallback on the fake default locale.
  }
}

/**
 * Get the locales state being used by `next-multilingual`.
 *
 * @param nextLocalesState - The state of the locales used by Next.js.
 *
 * @returns The locales state being used by `next-multilingual`.
 */
export function getLocalesState(nextLocalesState: LocalesState): LocalesState {
  return {
    locale: getActualLocale(nextLocalesState),
    locales: getActualLocales(nextLocalesState),
    defaultLocale: getActualDefaultLocale(nextLocalesState),
  }
}

/**
 * Get the locales config being used by `next-multilingual`.
 *
 * @param nextLocalesConfig - The Next.js locales configuration.
 *
 * @returns The locales config being used by `next-multilingual`.
 */
export function getLocalesConfig(nextLocalesConfig: LocalesConfig): LocalesConfig {
  return {
    locales: getActualLocales(nextLocalesConfig),
    defaultLocale: getActualDefaultLocale(nextLocalesConfig),
  }
}

/**
 * Get the locales state being used by `next-multilingual`.
 *
 * @param context - The `GetStaticProps` context containing the "raw" Next.js locales.
 *
 * @returns The actual locales state being used by `next-multilingual`.
 */
export function getStaticPropsLocales(context: GetStaticPropsContext): LocalesState {
  return getLocalesState(context as LocalesState)
}

/**
 * Get the locales config being used by `next-multilingual`.
 *
 * @param context - The `GetStaticPaths` context containing the "raw" Next.js locales.
 *
 * @returns The actual locales config being used by `next-multilingual`.
 */
export function getStaticPathsLocales(context: GetStaticPathsContext): LocalesConfig {
  return getLocalesConfig(context as LocalesConfig)
}

/**
 * Get the locales state being used by `next-multilingual`.
 *
 * @param context - The `GetServerSideProps` context containing the "raw" Next.js locales.
 *
 * @returns The actual locales state being used by `next-multilingual`.
 */
export function getServerSidePropsLocales(context: GetServerSidePropsContext): LocalesState {
  return getLocalesState(context as LocalesState)
}

/**
 * Multilingual static path objects that can be used in `getStaticPaths`.
 *
 * @example { params: { city: 'paris' }, locale: 'fr-FR' }
 */
export type MultilingualStaticPath = {
  /** Key/values object representing parameters. */
  params: ParsedUrlQuery
  /** The locale of the path. */
  locale: string
}

/**
 * Dynamically resolves the locale on `/`.
 *
 * @param context - A Next.js `GetServerSidePropsContext` object.
 *
 * @returns The best possible locale for a given user.
 */
export function resolveLocale(context: GetServerSidePropsContext): string {
  const { locale, locales, defaultLocale } = getServerSidePropsLocales(context)
  const cookieLocale = getCookieLocale(context, locales)
  let resolvedLocale = locale

  // When Next.js tries to use the default locale, try to find a better one.
  if (context.locale === context.defaultLocale) {
    resolvedLocale =
      cookieLocale ??
      getPreferredLocale(
        context.req.headers['accept-language'],
        locales,
        defaultLocale
      ).toLowerCase()
  }
  return resolvedLocale
}

/**
 * Force Next.js to use the actual (proper) locale.
 *
 * This will inject the correct locale into Next.js' router so that both SSR and client side stay in sync when using
 * the default "fake" (mul) locale. By default, locale detection is enabled and will track the locale in a cookie that
 * `next-multilingual` can use as a "preference" when going back to the homepage.
 *
 * @param localeDetection - By setting this parameter to `false` the locale will not be store in the `next-multilingual` cookie.
 */
export function useActualLocale(localeDetection = true): void {
  /**
   * Note that because some of the Next.js router properties are "readonly", we can only inject the `locale` property while
   * slightly modifying the other properties to avoid `undefined` without causing React hydration error. This is also why we
   * have our own `useRouter` wrapper which has for main goal to provide the correct locales state.
   */
  const router = useRouter()
  const nextLocalesState = getNextLocalesState(router)

  // Automatically overwrites the locale if it's using the default locale.
  router.locale = getLocalesState(nextLocalesState).locale
  // Leave the default locale intact (without `undefined`) to avoid hydration issue while being to use other wrapper APIs.
  router.defaultLocale = nextLocalesState.defaultLocale

  useEffect(() => {
    if (localeDetection) {
      setCookieLocale(router.locale)
    } else {
      Cookies.destroy(undefined, LOCALE_COOKIE_NAME)
    }
  }, [localeDetection, router.locale])
}

/**
 * Force Next.js to use a locale that was resolved dynamically on the homepage.
 *
 * This will inject the correct locale into Next.js' router so that both SSR and client side stay in sync when using
 * a dynamic locale on the homepage.
 *
 * @param locale - The locale that has been resolved by the server.
 */
export function useResolvedLocale(locale: string): void {
  const router = useRouter()
  router.locale = locale
  setCookieLocale(locale)
}

/**
 * Get the value for the `<html>` tag `lang` attribute.
 *
 * @param document - A Next.js `Document` object.
 *
 * @returns The normalized locale value of the current page.
 */
export function getHtmlLang(document: Document): string {
  // Try to get the resolved locale if dynamic resolution is enabled.
  const resolvedLocale = (document.props.__NEXT_DATA__.props as ResolvedLocaleNextDataProps)
    ?.pageProps?.resolvedLocale as string | undefined
  // The actual locale currently used by Next.js.
  const { locale } = getLocalesState(getNextLocalesState(document.props.__NEXT_DATA__))
  return normalizeLocale(resolvedLocale ?? locale)
}

/**
 * Get locale used by `next-multilingual`.
 *
 * To get a dynamic locale resolution on `/` without redirection, we need to add a "multilingual" locale as the
 * default locale so that we can identify when the homepage is requested without a locale. With this setup it
 * also means that we can no longer use Next.js' `locale`. This function is meant to return the locale
 * used by `next-multilingual` by removing the "fake" default locale.
 *
 * @param nextLocalesState - The state of the locales used by Next.js.
 *
 * @returns The locales used by `next-multilingual`.
 */
export function getActualLocale(nextLocalesState: LocalesState): string {
  return nextLocalesState.locale === nextLocalesState.defaultLocale
    ? getActualDefaultLocale(nextLocalesState)
    : nextLocalesState.locale
}

/**
 * Get the locales used by `next-multilingual`.
 *
 * To get a dynamic locale resolution on `/` without redirection, we need to add a "multilingual" locale as the
 * default locale so that we can identify when the homepage is requested without a locale. With this setup it
 * also means that we can no longer use Next.js' `locales`. This function is meant to return the list of locale
 * used by `next-multilingual` by removing the "fake" default locale.
 *
 * @param nextLocalesConfig - The Next.js locales configuration.
 *
 * @returns The list of locales used by `next-multilingual`.
 */
export function getActualLocales(nextLocalesConfig: LocalesConfig): string[] {
  return nextLocalesConfig.locales.filter((locale) => locale !== nextLocalesConfig.defaultLocale)
}

/**
 * Get the default locale used by `next-multilingual`.
 *
 * To get a dynamic locale resolution on `/` without redirection, we need to add a "multilingual" locale as the
 * default locale so that we can identify when the homepage is requested without a locale. With this setup it
 * also means that we can no longer use Next.js' `defaultLocale`. This function is meant to return the default locale
 * used by `next-multilingual` by removing the "fake" default locale. By convention (and for simplicity), the
 * first `locale` provided in the configuration is used as the default locale.
 *
 * @param nextLocalesConfig - The Next.js locales configuration.
 *
 * @returns The default locale used by `next-multilingual`.
 */
export function getActualDefaultLocale(nextLocalesConfig: LocalesConfig): string {
  return getActualLocales(nextLocalesConfig).shift() as string
}

/**
 * Is a given string a locale identifier following the `language`-`country` format?
 *
 * @param locale - A locale identifier.
 * @param checkNormalizedCase - Test is the provided locale follows the ISO 3166 case convention (language code lowercase, country code uppercase).
 *
 * @returns `true` if the string is a locale identifier following the `language`-`country`, otherwise `false`.
 */
export function isLocale(locale: string, checkNormalizedCase = false): boolean {
  const regexp = new RegExp(/^[a-z]{2}-[A-Z]{2}$/, !checkNormalizedCase ? 'i' : '')
  return regexp.test(locale)
}

/**
 * Get a normalized locale identifier.
 *
 * `next-multilingual` only uses locale identifiers following the `language`-`country` format. Locale identifiers
 * are case insensitive and can be lowercase, however it is recommended by ISO 3166 convention that language codes
 * are lowercase and country codes are uppercase.
 *
 * @param locale - A locale identifier.
 *
 * @returns The normalized locale identifier following the ISO 3166 convention.
 */
export function normalizeLocale(locale: string): string {
  if (!isLocale(locale)) {
    return locale
  }
  const [languageCode, countryCode] = locale.split('-')
  return `${languageCode.toLowerCase()}-${countryCode.toUpperCase()}`
}

/**
 * Generic type when using `getServerSideProps` on `/` to do dynamic locale detection.
 */
export type ResolvedLocaleServerSideProps = {
  /** The locale resolved by the server side detection. */
  readonly resolvedLocale: string
}

/**
 * This is use to type `document.props.__NEXT_DATA__.props` to get the locale during dynamic detection.
 */
export type ResolvedLocaleNextDataProps = {
  pageProps: ResolvedLocaleServerSideProps
}

/**
 * Resolve the preferred locale from an HTTP `Accept-Language` header.
 *
 * @param acceptLanguageHeader - The value of an HTTP request `Accept-Language` header.
 * @param actualLocales - The list of actual locales used by `next-multilingual`.
 * @param actualDefaultLocale - The actual default locale used by `next-multilingual`.
 *
 * @returns The preferred locale identifier.
 */
export function getPreferredLocale(
  acceptLanguageHeader: string | undefined,
  actualLocales: string[],
  actualDefaultLocale: string
): string {
  if (acceptLanguageHeader === undefined) {
    return actualDefaultLocale
  }
  return resolveAcceptLanguage(acceptLanguageHeader, actualLocales, actualDefaultLocale)
}

// The name of the cookie used to store the user locale, can be overwritten in an `.env` file.
const LOCALE_COOKIE_NAME = process.env.NEXT_PUBLIC_LOCALE_COOKIE_NAME ?? 'L'

// The lifetime of the cookie used to store the user locale, can be overwritten in an `.env` file.
const LOCALE_COOKIE_LIFETIME: number =
  process.env.NEXT_PUBLIC_LOCALE_COOKIE_LIFETIME !== undefined
    ? +process.env.NEXT_PUBLIC_LOCALE_COOKIE_LIFETIME
    : 60 * 60 * 24 * 365 * 10

/**
 * Save the current user's locale to the locale cookie.
 *
 * @param locale - A locale identifier.
 */
export function setCookieLocale(locale?: string): void {
  if (locale !== undefined) {
    Cookies.set(undefined, LOCALE_COOKIE_NAME, locale, {
      maxAge: LOCALE_COOKIE_LIFETIME,
      path: '/',
      sameSite: 'lax',
    })
  }
}

/**
 * Get the locale that was saved to the locale cookie.
 *
 * @param serverSidePropsContext - The Next.js server side properties context.
 * @param actualLocales - The list of actual locales used by `next-multilingual`.
 *
 * @returns The locale that was saved to the locale cookie.
 */
export function getCookieLocale(
  serverSidePropsContext: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
  actualLocales: string[]
): string | undefined {
  const cookies = Cookies.get(serverSidePropsContext)

  if (!Object.keys(cookies).includes(LOCALE_COOKIE_NAME)) {
    return undefined
  }
  const cookieLocale = cookies[LOCALE_COOKIE_NAME]

  if (!actualLocales.includes(cookieLocale)) {
    // Delete the cookie if the value is invalid (e.g., been tampered with).
    Cookies.destroy(serverSidePropsContext, LOCALE_COOKIE_NAME)
    return undefined
  }

  return cookieLocale
}
