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

export default { getActualLocales, getActualDefaultLocale };
