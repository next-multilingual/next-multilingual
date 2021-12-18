import type { Rewrite } from 'next/dist/lib/load-custom-routes';
import {
  containsRouterQueries,
  hydrateUrlQuery,
  rewriteParametersToRouterQueries,
  routerQueriesToRewriteParameters,
} from '..';
import { Url } from '../types';
import { getOrigin } from './get-origin';
import { getRewritesIndex } from './get-rewrites-index';

/**
 * Get the localized URL path when available, otherwise fallback to a standard non-localized Next.js URL.
 *
 * @param rewrites - An array of Next.js rewrite objects.
 * @param urlPath - A non-localized Next.js `href` without a locale prefix (e.g. `/contact-us`) or its equivalent using
 * a `UrlObject`.
 * @param locale - The locale of the localized URL.
 * @param basePath - A path prefix for the Next.js application.
 * @param absolute - Returns the absolute URL, including the protocol and domain (e.g. https://example.com/en-us/contact-us).
 *
 * @returns The localized URL path when available, otherwise fallback to a standard non-localized Next.js URL.
 */
export function getLocalizedUrl(
  rewrites: Rewrite[],
  urlPath: Url,
  locale: string,
  basePath: string = undefined,
  absolute = false
): string {
  let localizedUrl = urlPath['pathname'] !== undefined ? urlPath['pathname'] : urlPath;

  if (localizedUrl === '/') {
    localizedUrl = `/${locale}`; // Special rule for the homepage.
  } else {
    const isDynamicRoute = containsRouterQueries(localizedUrl);
    const searchablePath = isDynamicRoute
      ? routerQueriesToRewriteParameters(localizedUrl)
      : localizedUrl;
    const rewriteUrlMatch = getRewritesIndex(rewrites)?.[searchablePath]?.[locale];
    localizedUrl =
      rewriteUrlMatch !== undefined
        ? isDynamicRoute
          ? rewriteParametersToRouterQueries(rewriteUrlMatch)
          : rewriteUrlMatch
        : `/${locale}${localizedUrl}`; // Fallback with the original URL path when not found.
  }

  // Set base path (https://nextjs.org/docs/api-reference/next.config.js/basepath) if present.
  if (basePath !== undefined && basePath !== '') {
    if (basePath[0] !== '/') {
      throw new Error(`Specified basePath has to start with a /, found "${basePath}"`);
    }
    localizedUrl = `${basePath}${localizedUrl}`;
  }

  // Set origin if an absolute URL is requested.
  if (absolute) {
    const origin = getOrigin();
    localizedUrl = `${origin}${localizedUrl}`;
  }

  return urlPath['query'] !== undefined
    ? hydrateUrlQuery(localizedUrl, urlPath['query'])
    : localizedUrl;
}
