import { cyanBright } from 'colorette'
import type {
  GetServerSidePropsContext as NextGetServerSidePropsContext,
  GetStaticPropsContext as NextGetStaticPropsContext,
  PreviewData,
} from 'next'
import * as nextLog from 'next/dist/build/output/log'
import Document from 'next/document'
import { NextRouter, useRouter as useNextRouter } from 'next/router'
import { sep as pathSeparator } from 'node:path'
import type { ParsedUrlQueryInput } from 'node:querystring'
import { ParsedUrlQuery } from 'node:querystring'
import Cookies from 'nookies'
import { useEffect, useMemo } from 'react'
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
 * Locale configuration type, enforcing non-`undefined` values.
 */
export type LocaleConfig = {
  /** The current locale from Next.js. */
  locale: string
  /** The configured i18n default locale from Next.js. */
  defaultLocale: string
  /** The configured i18n locales from Next.js. */
  locales: string[]
}

/**
 * Get the Next.js locale configuration.
 *
 * @param locale - The current locale from Next.js.
 * @param defaultLocale - The configured i18n default locale from Next.js.
 * @param locales - The configured i18n locales from Next.js.
 *
 * @returns A `LocaleConfig` object that contains no `undefined` values.
 */
export function getLocaleConfig(
  locale?: string,
  defaultLocale?: string,
  locales?: string[]
): LocaleConfig {
  if (locales === undefined) {
    throw new Error('locales must be configured in Next.js')
  }

  // There are edge cases (e.g. Internal Server Errors) where `defaultLocale` and `locale` are `undefined`.
  return {
    defaultLocale: defaultLocale ?? locales[0],
    locale: locale ?? locales[1],
    locales,
  }
}

/**
 * Wrapper on top of Next.js' `useRouter` to:
 *
 * - automatically overwrite the locale if it's using the default locale.
 * - make sure that locale configuration is never `undefined`.
 *
 * @returns An extended `NextRouter` using `next-multilingual`'s actual locale (and no `undefined` values).
 */
export function useRouter(): NextRouter & LocaleConfig {
  const router = useNextRouter()

  // Only recomputes if the router changes (useful if `useRouter` is called multiple times on the same page).
  return useMemo(() => {
    const localeConfig = getLocaleConfig(router.locale, router.defaultLocale, router.locales)
    // Automatically overwrites the locale if it's using the default locale.
    router.locale = getActualLocale(router.locale, router.defaultLocale, router.locales)
    // Leave the default locale intact (without `undefined`) so that we can still use the other "getActual" APIs.
    router.defaultLocale = localeConfig.defaultLocale
    return router as NextRouter & LocaleConfig
  }, [router])
}

/**
 * `GetStaticPropsContext` where `locale`, `defaultLocale` and `locales` are never `undefined`.
 */
export type GetStaticPropsContext = NextGetStaticPropsContext & LocaleConfig

/**
 * `GetServerSidePropsContext` where `locale`, `defaultLocale` and `locales` are never `undefined`.
 */
export type GetServerSidePropsContext = NextGetServerSidePropsContext & LocaleConfig

/**
 * Dynamically resolves the locale on `/`.
 *
 * @param context - A Next.js `GetServerSidePropsContext` object.
 *
 * @returns The best possible locale for a given user.
 */
export function resolveLocale(context: NextGetServerSidePropsContext): string {
  const { req, locale, locales, defaultLocale } = context

  const actualLocales = getActualLocales(locales, defaultLocale)
  const actualDefaultLocale = getActualDefaultLocale(locales, defaultLocale)
  const cookieLocale = getCookieLocale(context, actualLocales)
  let resolvedLocale = getActualLocale(locale, defaultLocale, locales)

  // When Next.js tries to use the default locale, try to find a better one.
  if (locale === defaultLocale) {
    resolvedLocale =
      cookieLocale ??
      getPreferredLocale(
        req.headers['accept-language'],
        actualLocales,
        actualDefaultLocale
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
  const router = useRouter()
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
  const router = useNextRouter()
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
  const { locale, locales, defaultLocale, props } = document.props.__NEXT_DATA__

  const pagePropsActualLocale: string = (props as ResolvedLocaleNextDataProps)?.pageProps
    ?.resolvedLocale
  return normalizeLocale(pagePropsActualLocale ?? getActualLocale(locale, defaultLocale, locales))
}

/**
 * Get the actual locale based on the current locale from Next.js.
 *
 * To get a dynamic locale resolution on `/` without redirection, we need to add a "multilingual" locale as the
 * default locale so that we can identify when the homepage is requested without a locale. With this setup it
 * also means that we can no longer easily know what is the current locale. This function is meant to return the
 * actual current of locale by replacing the "multilingual" default locale by the actual default locale.
 *
 * @param locale - The current locale from Next.js.
 * @param defaultLocale - The configured i18n default locale from Next.js.
 * @param locales - The configured i18n locales from Next.js.
 *
 * @returns The list of actual locales.
 */
export function getActualLocale(
  locale?: string,
  defaultLocale?: string,
  locales?: string[]
): string {
  const localeConfig = getLocaleConfig(locale, defaultLocale, locales)
  const actualDefaultLocale = getActualDefaultLocale(
    localeConfig.locales,
    localeConfig.defaultLocale
  )
  return localeConfig.locale === localeConfig.defaultLocale
    ? actualDefaultLocale
    : localeConfig.locale
}

/**
 * Get the actual locales based on the Next.js i18n locale configuration.
 *
 * To get a dynamic locale resolution on `/` without redirection, we need to add a "multilingual" locale as the
 * default locale so that we can identify when the homepage is requested without a locale. With this setup it
 * also means that we can no longer use `locales`. This function is meant to return the actual list of locale
 * by removing the "multilingual" default locale.
 *
 * @param locales - The configured i18n locales from Next.js.
 * @param defaultLocale - The configured i18n default locale from Next.js.
 *
 * @returns The list of actual locales.
 */
export function getActualLocales(locales?: string[], defaultLocale?: string): string[] {
  const localeConfig = getLocaleConfig(undefined, defaultLocale, locales)
  return localeConfig.locales.filter((locale) => locale !== defaultLocale)
}

/**
 * Get the actual default locale based on the Next.js i18n locale configuration.
 *
 * To get a dynamic locale resolution on `/` without redirection, we need to add a "multilingual" locale as the
 * default locale so that we can identify when the homepage is requested without a locale. With this setup it
 * also means that we can no longer use `defaultLocale`. This function is meant to return the actual default
 * locale (excluding the "multilingual" default locale). By convention (and for simplicity), the first
 * `actualLocales` will be used as the actual default locale.
 *
 * @param locales - The configured i18n locales from Next.js.
 * @param defaultLocale - The configured i18n default locale from Next.js.
 *
 * @returns The actual default locale.
 */
export function getActualDefaultLocale(locales?: string[], defaultLocale?: string): string {
  return getActualLocales(locales, defaultLocale).shift() as string
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
 * Generic type when using trying to access `pageProps` to get the locale during dynamic detection.
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
  serverSidePropsContext: NextGetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
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

/**
 * Hydrate a path back with its query values.
 *
 * Missing query parameters will show warning messages and will be kept in their original format.
 *
 * @see https://nextjs.org/docs/routing/dynamic-routes
 *
 * @param path - A path containing "query parameters".
 * @param parsedUrlQueryInput - A `ParsedUrlQueryInput` object containing router queries.
 * @param suppressWarning - If set to true, will not display a warning message if the key is missing.
 *
 * @returns The hydrated path containing `query` values instead of placeholders.
 */
export function hydrateQueryParameters(
  path: string,
  parsedUrlQueryInput: ParsedUrlQueryInput,
  suppressWarning = false
): string {
  const pathSegments = path.split('/')
  const missingParameters: string[] = []

  const hydratedPath = pathSegments
    .map((pathSegment) => {
      if (/^\[.+]$/.test(pathSegment)) {
        const parameterName = pathSegment.slice(1, -1)
        if (parsedUrlQueryInput[parameterName] !== undefined) {
          return parsedUrlQueryInput[parameterName]
        } else {
          missingParameters.push(parameterName)
        }
      }
      return pathSegment
    })
    .join('/')

  if (missingParameters.length > 0 && !suppressWarning) {
    log.warn(
      `unable to hydrate the path ${highlight(path)} because the following query parameter${
        missingParameters.length > 1 ? 's are' : ' is'
      } missing: ${highlight(missingParameters.join(','))}.`
    )
  }

  return hydratedPath
}

/**
 * Convert a path using "query parameters" to "rewrite parameters".
 *
 * Next.js' router uses the bracket format (e.g., `/[example]`) to identify dynamic routes, called "query parameters". The
 * rewrite statements use the colon format (e.g., `/:example`), called "rewrite parameters".
 *
 * @see https://nextjs.org/docs/routing/dynamic-routes
 * @see https://nextjs.org/docs/api-reference/next.config.js/rewrites
 *
 * @param path - A path containing "query parameters".
 *
 * @returns The path converted to the "rewrite parameters" format.
 */
export function queryToRewriteParameters(path: string): string {
  return path
    .split('/')
    .map((pathSegment) => {
      if (/^\[.+]$/.test(pathSegment)) {
        return `:${pathSegment.slice(1, -1)}`
      }
      return pathSegment
    })
    .join('/')
}

/**
 * Convert a path using "rewrite parameters" to "query parameters".
 *
 * Next.js' router uses the bracket format (e.g., `/[example]`) to identify dynamic routes, called "query parameters". The
 * rewrite statements use the colon format (e.g., `/:example`), called "rewrite parameters".
 *
 * @see https://nextjs.org/docs/routing/dynamic-routes
 * @see https://nextjs.org/docs/api-reference/next.config.js/rewrites
 *
 * @param path - A path containing "rewrite parameters".
 *
 * @returns The path converted to the "router queries" format.
 */
export function rewriteToQueryParameters(path: string): string {
  return path
    .split('/')
    .map((pathSegment) => {
      if (pathSegment.startsWith(':')) {
        return `[${pathSegment.slice(1)}]`
      }
      return pathSegment
    })
    .join('/')
}

/**
 * Does a given path contain "query parameters" (using the bracket syntax)?
 *
 * @param path - A path containing "query parameters".
 *
 * @returns True if the path contains "query parameters", otherwise false.
 */
export function containsQueryParameters(path: string): boolean {
  return path.split('/').some((pathSegment) => /^\[.+]$/.test(pathSegment))
}

/**
 * Get "query parameters" (using the bracket syntax) from a path.
 *
 * @param path - A path containing "query parameters".
 *
 * @returns An array of "query parameters" or an empty array when not found.
 */
export function getQueryParameters(path: string): string[] {
  const parameters = path.split('/').filter((pathSegment) => /^\[.+]$/.test(pathSegment))

  if (parameters === undefined) {
    return []
  }

  return parameters.map((parameter) => parameter.slice(1, -1))
}

/**
 * Strips the base path from a URL if present.
 *
 * @param url - The URL from which to strip the base path.
 * @param basePath - The base path to strip.
 *
 * @returns The URL without the base path if present.
 */
export function stripBasePath(url: string, basePath: string): string {
  if (url.startsWith(basePath)) {
    return url.replace(basePath, '')
  }
  return url
}
