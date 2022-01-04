export const LOCALES = ['en-US', 'fr-CA'];
export const LOCALE_NAMES = {
  'en-US': 'English (United States)',
  'fr-CA': 'Français (Canada)',
};

export const DEFAULT_LOCALE = LOCALES[0];

export const ORIGIN = Cypress.env('isProd') ? Cypress.env('prodBaseUrl') : Cypress.config().baseUrl;
