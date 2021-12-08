import resolveAcceptLanguage from 'resolve-accept-language';
import type { NextPageContext } from 'next';
import Cookies from 'nookies';
import { sep as pathSeparator } from 'path';

import * as nextLog from 'next/dist/build/output/log';
import { cyanBright } from 'colorette';
import type { ParsedUrlQuery } from 'querystring';

/**
 * Wrapper in front of Next.js' log to only show messages in non-production environments.
 *
 * To avoid exposing sensitive data (e.g. server paths) to the clients, we only display logs in non-production environments.
 */
export class log {
  /**
   * Log a warning message in the console(s) to non-production environments.
   *
   * @param message - The warning message to log.
   */
  static warn(message: string): void {
    if (process.env.NODE_ENV !== 'production') {
      nextLog.warn(message);
    }
  }
}

/**
 * Highlight a segment of a log message.
 *
 * @param segment - A segment of a log message.
 *
 * @returns The highlighted segment of a log message.
 */
export function highlight(segment: string): string {
  return cyanBright(segment);
}

/**
 * Highlight a file path segment of a log message, normalized with the current file system path separator
 *
 * @param filePath - A file path segment of a log message.
 *
 * @returns The highlighted file path segment of a log message.
 */
export function highlightFilePath(filePath: string): string {
  return highlight(pathSeparator !== '/' ? filePath.replace(/\//g, pathSeparator) : filePath);
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
export function getActualLocale(locale: string, defaultLocale: string, locales: string[]): string {
  const actualDefaultLocale = getActualDefaultLocale(locales, defaultLocale);
  return locale === defaultLocale ? actualDefaultLocale : locale;
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
export function getActualLocales(locales: string[], defaultLocale: string): string[] {
  return locales.filter((locale) => locale !== defaultLocale);
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
export function getActualDefaultLocale(locales: string[], defaultLocale: string): string {
  return getActualLocales(locales, defaultLocale).shift();
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
  const regexp = new RegExp(/^[a-z]{2}-[A-Z]{2}$/, !checkNormalizedCase ? 'i' : '');
  return regexp.test(locale);
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
    return locale;
  }
  const [languageCode, countryCode] = locale.split('-');
  return `${languageCode.toLowerCase()}-${countryCode.toUpperCase()}`;
}

/**
 * Generic properties for multilingual messages when using `getServerSideProps` on `/`.
 */
export type ResolvedLocaleServerSideProps = {
  /** The locale resolved by the server side detection. */
  readonly resolvedLocale: string;
};

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
  acceptLanguageHeader: string,
  actualLocales: string[],
  actualDefaultLocale: string
): string {
  return resolveAcceptLanguage(acceptLanguageHeader, actualLocales, actualDefaultLocale);
}

// The name of the cookie used to store the user locale, can be overwritten in an `.env` file.
const LOCALE_COOKIE_NAME = process.env.NEXT_PUBLIC_LOCALE_COOKIE_NAME
  ? process.env.NEXT_PUBLIC_LOCALE_COOKIE_NAME
  : 'L';

// The lifetime of the cookie used to store the user locale, can be overwritten in an `.env` file.
const LOCALE_COOKIE_LIFETIME = process.env.NEXT_PUBLIC_LOCALE_COOKIE_LIFETIME
  ? process.env.NEXT_PUBLIC_LOCALE_COOKIE_LIFETIME
  : 60 * 60 * 24 * 365 * 10;

/**
 * Save the current user's locale to the locale cookie.
 *
 * @param locale - A locale identifier.
 */
export function setCookieLocale(locale: string): void {
  Cookies.set(null, LOCALE_COOKIE_NAME, locale, {
    maxAge: LOCALE_COOKIE_LIFETIME,
    path: '/',
  });
}

/**
 * Get the locale that was saved to the locale cookie.
 *
 * @param nextPageContext - The Next.js page context.
 * @param actualLocales - The list of actual locales used by `next-multilingual`.
 *
 * @returns The locale that was saved to the locale cookie.
 */
export function getCookieLocale(nextPageContext: NextPageContext, actualLocales: string[]): string {
  const cookies = Cookies.get(nextPageContext);

  if (!Object.keys(cookies).includes(LOCALE_COOKIE_NAME)) {
    return undefined;
  }
  const cookieLocale = cookies[LOCALE_COOKIE_NAME];

  if (!actualLocales.includes(cookieLocale)) {
    // Delete the cookie if the value is invalid (e.g. been tampered with).
    Cookies.destroy(nextPageContext, LOCALE_COOKIE_NAME);
    return undefined;
  }

  return cookieLocale;
}

/**
 * Hydrate a URL back with its query values.
 *
 * This allows to re-inject dynamic routes values back into URLs.
 *
 * @see https://nextjs.org/docs/routing/dynamic-routes
 *
 * @param pathname - The `pathname` property coming from Next.js' `useRouter()`.
 * @param parsedUrlQuery - A `ParsedUrlQuery` object containing URL queries.
 *
 * @returns The hydrated URL containing `query` values instead of placeholders.
 */
export function hydrateUrlQuery(pathname: string, parsedUrlQuery: ParsedUrlQuery): string {
  if (!parsedUrlQuery || !Object.entries(parsedUrlQuery).length) {
    return pathname;
  }

  let usableUrl = pathname;
  for (const [queryName, queryValue] of Object.entries(parsedUrlQuery)) {
    if (typeof queryValue === 'string') {
      // `ParsedUrlQuery` can also contain arrays, which does not apply to URLs.
      usableUrl = usableUrl.replace(`[${queryName}]`, queryValue as string);
    }
  }
  return usableUrl;
}
