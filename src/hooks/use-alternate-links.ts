import { useRouter } from 'next/router';
import { normalizeUrlPath } from '../helpers/normalize-url-path';
import { getOrigin } from '../helpers/get-origin';
import { getLocalizedUrlPath } from '../helpers/get-localized-url-path';
import { useRewrites } from './use-rewrites';
import { getActualLocales } from '..';

/**
 * Alternate links tell search engines which localized version of a page exists.
 */
interface AlternateLink {
  /** A fully-qualified URL of a page in a specific locale. */
  href: string;
  /** The target locale, or `x-default` for pages that can dynamically resolve different locales. */
  hrefLang: string;
}

/**
 * A hook to get the alternate links of your current page.
 *
 * Alternative links provide information to search engines that a given page is available in other languages.
 *
 * @returns A list of alternate links for your current page.
 */
export function useAlternateLinks(): AlternateLink[] {
  const { basePath, pathname: urlPath, defaultLocale, locales, route } = useRouter();
  const rewrites = useRewrites();
  const origin = getOrigin();
  const normalizedBasePath = normalizeUrlPath(basePath);

  const alternateLinks = getActualLocales(locales, defaultLocale).map((locale) => {
    const localizedUrlPath = getLocalizedUrlPath(rewrites, locale, urlPath);

    return {
      href: `${origin}${normalizedBasePath}${localizedUrlPath}`,
      hrefLang: locale,
    };
  });

  /**
   * `x-default` is meant to be used for pages that have "dynamic" locales. The only valid use case for most websites is
   * the home page where the language detection can happen. After this initial locale resolution, all other URLs should use
   * prefixes and the `x-default` link should not be required.
   */
  if (route === '/') {
    alternateLinks.push({
      href: `${origin}${normalizedBasePath}`,
      hrefLang: 'x-default',
    });
  }

  return alternateLinks;
}
