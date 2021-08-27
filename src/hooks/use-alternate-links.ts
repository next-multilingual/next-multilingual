import { useRouter } from 'next/router';
import { normalizeUrlPath } from '../helpers/normalize-url-path';
import { getOrigin } from '../helpers/get-origin';
import { getLocalizedUrlPath } from '../helpers/get-localized-url-path';
import { useRewrites } from './use-rewrites';
import { getActualLocales, normalizeLocale } from '..';

/**
 * Alternate links tell search engines which localized version of a page exists.
 */
export type AlternateLink = {
  /** A fully-qualified URL of a page in a specific locale. */
  href: string;
  /** The target locale, or `x-default` for pages that can dynamically resolve different locales. */
  hrefLang: string;
  /** The unique key to use in Next.js `<Head>`. */
  key: string;
};

/**
 * A hook to get the alternate links of your current page.
 *
 * Alternative links provide information to search engines that a given page is available in other languages. URL queries will
 * be added to alternate links regardless if they are valid or not, but they will be removed from canonical links to avoid
 * content duplication issues.
 *
 * @returns An array of alternate links objects for the current page.
 */
export function useAlternateLinks(): AlternateLink[] {
  const { basePath, asPath, defaultLocale, locales, route } = useRouter();
  const rewrites = useRewrites();
  const origin = getOrigin();
  const [urlPath, asPathQuery] = asPath.split('?');
  const urlSearchParamsString = new URLSearchParams(asPathQuery).toString();
  const urlQuery = urlSearchParamsString ? `?${urlSearchParamsString}` : '';
  const normalizedBasePath = normalizeUrlPath(basePath);

  const alternateLinks: AlternateLink[] = getActualLocales(locales, defaultLocale).map((locale) => {
    const localizedUrlPath = getLocalizedUrlPath(rewrites, locale, urlPath);
    const href = `${origin}${normalizedBasePath}${localizedUrlPath}${urlQuery}`;
    const hrefLang = normalizeLocale(locale);
    const key = `alternate-link-${hrefLang}`;

    return {
      href,
      hrefLang,
      key,
    };
  });

  /**
   * `x-default` is meant to be used for pages that have "dynamic" locales. The only valid use case for most websites is
   * the home page where the language detection can happen. After this initial locale resolution, all other URLs should use
   * prefixes and the `x-default` link should not be required.
   */
  if (route === '/') {
    const href = `${origin}${normalizedBasePath}${urlQuery}`;
    const hrefLang = 'x-default';
    const key = `alternate-link-${hrefLang}`;
    alternateLinks.push({
      href,
      hrefLang,
      key,
    });
  }

  return alternateLinks;
}
