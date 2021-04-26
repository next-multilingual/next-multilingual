/**
 * Get the supported locales details based on the Next.js i18n locale configuration.
 *
 * To get a dynamic locale resolution on `/` without redirection, we need to add a "multilingual" locale as the
 * default locale so that we can identify when the homepage is requested without a locale. With this setup it
 * also means that we can no longer use the `defaultLocale`. By convention (and for simplicity), the first
 * `supportedLocales` will be used as the new `defaultLocale`.
 *
 * @param locales - The configured i18n locales from Next.js.
 * @param multilingual - The string representing the "multilingual" locale. We recommend simply using "mul" since
 * it is BCP 47 compliant.
 *
 * @returns The list of supported locales.
 */
export function getSupportedLocales(locales: string[], multilingual: string): string[] {
  return locales.filter((locale) => locale !== multilingual);
}

/**
 * Get the supported locales details based on the Next.js i18n locale configuration.
 *
 * @param supportedLocales - The locales coming from `getSupportedLocales`.
 *
 * @returns The default locale.
 */
export function getDefaultLocale(supportedLocales: string[]): string {
  return supportedLocales[0];
}

export default { getSupportedLocales, getDefaultLocale };
