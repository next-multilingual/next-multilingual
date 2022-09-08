/** The default locale configure in Next.js. */
export const DEFAULT_LOCALE = 'mul'

/** The actual locale used by the Next.js application. */
export const ACTUAL_LOCALES = ['en-US', 'fr-CA']

/** All locales configured in Next.js. */
export const LOCALES = [DEFAULT_LOCALE, ...ACTUAL_LOCALES]

/**
 * String constants which are defined by locale.
 *
 * @example {'en-US': 'hello', 'fr-CA': 'bonjour'}
 */
export type LocalizedConstant = {
  [locale: string]: string
}

/** String array constants which are defined by locale. */
export type LocalizedConstantArray = {
  [key: string]: string[]
}

/** Localized messages. */
export type Messages = {
  [key: string]: string
}

/** Human-readable locale names. */
export const LOCALE_NAMES: LocalizedConstant = {
  mul: 'Multilingual (default locale)',
  'en-US': 'English (United States)',
  'fr-CA': 'Français (Canada)',
}

/** The actual default locale used by the Next.js application. */
export const ACTUAL_DEFAULT_LOCALE = ACTUAL_LOCALES[0]

/** The origin used by the Next.js application. */
export const ORIGIN: string = (
  Cypress.env('isProd') ? Cypress.env('prodBaseUrl') : Cypress.config().baseUrl
) as string

/** The base path of the Next.js application. (set manually when testing `basePath`) */
export const BASE_PATH: string = (
  Cypress.env('basePath') !== undefined ? Cypress.env('basePath') : ''
) as string
