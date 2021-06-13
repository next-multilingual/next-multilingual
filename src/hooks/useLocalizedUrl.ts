import { getLocalizedUrl } from '../helpers/getLocalizedUrl';
import { useRewrites } from './useRewrites';

/**
 * Hook to get the localized URL from a standard non-localized Next.js URL.
 *
 * @param locale - The locale of the localized URL.
 * @param urlPath - The non-localized URL path (e.g. `/contact-us`).
 *
 * @returns The localized URL.
 */
export function useLocalizedUrl(locale: string, urlPath: string): string {
  const rewrites = useRewrites();
  return getLocalizedUrl(rewrites, locale, urlPath);
}
