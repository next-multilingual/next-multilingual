import type { Rewrite } from 'next/dist/lib/load-custom-routes';
import { highlight, isLocale, log } from '../';

/** Track the `rewrites` arguments used when calling `getRewritesIndex` to automatically flush the cache. */
let lastRewrites: Rewrite[];
/** Local rewrite index cache to avoid non-required operations. */
let rewritesIndexCache: RewriteIndex;

/** The `RewriteIndex` is a simple object where the properties are non-localized URLs, and the values, `RewriteLocaleIndex` objects.  */
export type RewriteIndex = {
  [nonLocalizedUrl: string]: RewriteLocaleIndex;
};

/** The `RewriteLocaleIndex` is a simple object where the properties are lowercased locales, and the values, localized URLs.  */
export type RewriteLocaleIndex = {
  [locale: string]: string;
};

/**
 * Get a object which allows O(1) localized URL access by using a non-localized URL and a locale.
 *
 * The returned object is cached locally for performance, so this API can be called frequented.
 *
 * @param rewrites - An array of Next.js rewrite objects.
 *
 * @returns An object which allows O(1) localized URL access by using a non-localized URL and a locale.
 */
export function getRewritesIndex(rewrites: Rewrite[]): RewriteIndex {
  if (rewritesIndexCache && lastRewrites === rewrites) return rewritesIndexCache;

  lastRewrites = rewrites; // Track last `rewrites` to hit cache.

  const rewritesIndex: RewriteIndex = {};

  // Build localized URL objects.
  rewrites.forEach((rewrite) => {
    if (rewrite.locale !== false) {
      return; // Only process `next-multilingual` rewrites.
    }
    const urlSegments = rewrite.destination.split('/');
    const urlLocale = urlSegments[1];

    if (!isLocale(urlLocale)) {
      return; // Only process actual locales.
    }

    const nonLocalizedUrl = `/${urlSegments.slice(2).join('/')}`;

    if (!rewritesIndex[nonLocalizedUrl]) {
      rewritesIndex[nonLocalizedUrl] = {};
    }

    if (rewritesIndex[nonLocalizedUrl][urlLocale]) {
      log.warn(
        `rewrite collision found between ${highlight(
          rewritesIndex[nonLocalizedUrl][urlLocale]
        )} and ${highlight(rewrite.source)}`
      );
      return;
    }

    // Add the index entry that allow direct localized URL access by using a non-localized URL and a locale.
    rewritesIndex[nonLocalizedUrl][urlLocale] = rewrite.source;
  });

  // Save to the cache.
  rewritesIndexCache = rewritesIndex;
  return rewritesIndexCache;
}
