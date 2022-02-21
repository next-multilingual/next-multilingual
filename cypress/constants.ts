/** The default locale configure in Next.js. */
export const DEFAULT_LOCALE = 'mul';

/** The actual locale used by the Next.js application. */
export const ACTUAL_LOCALES = ['en-US', 'fr-CA'];

/** All locales configured in Next.js. */
export const LOCALES = [DEFAULT_LOCALE, ...ACTUAL_LOCALES];

/** Human-readable locale names. */
export const LOCALE_NAMES = {
  mul: 'Multilingual (default locale)',
  'en-US': 'English (United States)',
  'fr-CA': 'Français (Canada)',
};

/** The actual default locale used by the Next.js application. */
export const ACTUAL_DEFAULT_LOCALE = ACTUAL_LOCALES[0];

/** The origin used by the Next.js application. */
export const ORIGIN = Cypress.env('isProd') ? Cypress.env('prodBaseUrl') : Cypress.config().baseUrl;
