import { Rewrite } from 'next/dist/lib/load-custom-routes'
import { DEFAULT_LOCALE } from '../'

/**
 * Normalize a rewrite object from raw Next.js rewrite objects.
 *
 * @param rewrite - A rewrite object.
 * @param hasBasePath - Is the current configuration using a base path?
 *
 * @returns A normalized rewrite object.
 */
export const normalizeRewrite = (rewrite: Rewrite): Rewrite => {
  const { source, destination } = rewrite
  /**
   * As of Next.js 13.4.13, the format of the `Rewrite` configuration objects no longer includes
   * the `locale` attribute. To check for rewrite configurations that include all locales, we can
   * search for the `nextInternalLocale` key:
   *
   * {source: "\u002F:nextInternalLocale(mul|en\\-us|fr\\-ca)\u002Fnon-localized", destination: "\u002F:nextInternalLocale\u002Fabout-us"}
   */
  const matchAllLocales = source.includes(`/:nextInternalLocale(${DEFAULT_LOCALE}`)
  const locale = rewrite.locale === false ? false : matchAllLocales ? undefined : false

  return {
    source,
    destination,
    locale,
  }
}
