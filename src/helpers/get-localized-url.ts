import type { Rewrite } from 'next/dist/lib/load-custom-routes';

/**
 * Get the localized URL from a standard non-localized Next.js URL.
 *
 * Using the `Rewrite` objects, the `destination` is the standard Next.js "localized" URL (e.g. `/fr-ca/contact-us`) and
 * the `source` is the real localized URL (e.g. `/fr-ca/nous-joindre`).
 *
 * @param rewrites - An array of Next.js rewrite objects.
 * @param locale - The locale of the localized URL.
 * @param urlPath - The non-localized URL path (e.g. `/contact-us`).
 *
 * @returns The localized URL.
 */
export function getLocalizedUrl(rewrites: Rewrite[], locale: string, urlPath: string): string {
  const destinationUrlPath = `/${locale}${urlPath}`;
  const rewrite = rewrites.find(
    (rewrite) => rewrite.locale === false && rewrite.destination === destinationUrlPath
  );

  return rewrite ? rewrite.source : destinationUrlPath; // Fallback on the destination URL path when not found.
}
