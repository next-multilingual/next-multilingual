import type { Rewrite } from 'next/dist/lib/load-custom-routes';
import { normalizeUrlPath } from './normalize-url-path';

/**
 * Get the localized URL path (without the locale prefix) from a standard non-localized Next.js URL path.
 *
 * Using the `Rewrite` objects, the `destination` is the standard Next.js "localized" URL (e.g. `/fr-ca/contact-us`) and
 * the `source` is the real localized URL (e.g. `/fr-ca/nous-joindre`).
 *
 * @param rewrites - An array of Next.js rewrite objects.
 * @param locale - The locale of the localized URL.
 * @param urlPath - a standard non-localized Next.js URL path without the locale prefix (e.g. `/contact-us`).
 *
 * @returns The localized URL.
 */
export function getLocalizedUrlPath(rewrites: Rewrite[], locale: string, urlPath: string): string {
  const normalizedUrlPath = normalizeUrlPath(urlPath);
  const destinationUrlPath = `/${locale}${normalizedUrlPath}`;
  const rewrite = rewrites.find(
    (rewrite) => rewrite.locale === false && rewrite.destination === destinationUrlPath
  );

  return rewrite ? rewrite.source : destinationUrlPath; // Fallback with the original URL path when not found.
}
