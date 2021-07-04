import resolveAcceptLanguage from 'resolve-accept-language';

/**
 * Get the actual locale based on the current locale from Next.js.
 *
 * To get a dynamic locale resolution on `/` without redirection, we need to add a "multilingual" locale as the
 * default locale so that we can identify when the homepage is requested without a locale. With this setup it
 * also means that we can no longer easily know what is the current locale. This function is meant to return the
 * actual current of locale by replacing the "multilingual" default locale by the actual default locale.
 *
 * @param locale - The current locale from Next.js.
 * @param defaultLocale - The configured i18n default locale from Next.js. We recommend simply using "mul"
 * (to represent "multilingual") since it is BCP 47 compliant.
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
 * @param defaultLocale - The configured i18n default locale from Next.js. We recommend simply using "mul"
 * (to represent "multilingual") since it is BCP 47 compliant.
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
 * @param defaultLocale - The configured i18n default locale from Next.js. We recommend simply using "mul"
 * (to represent "multilingual") since it is BCP 47 compliant.
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
 * Resolve the preferred locale from an HTTP `Accept-Language` header.
 *
 * @param acceptLanguageHeader - The value of an HTTP request `Accept-Language` header.
 * @param locales - The list of actual locales used by `next-multilingual`.
 * @param defaultLocale - The actual default locale used by `next-multilingual`.
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
