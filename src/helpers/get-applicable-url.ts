import type { Rewrite } from 'next/dist/lib/load-custom-routes';
import {
  containsRouterQueries,
  rewriteParametersToRouterQueries,
  routerQueriesToRewriteParameters,
} from '..';
import { getOrigin } from './get-origin';
import { getRewritesIndex } from './get-rewrites-index';

/**
 * Get the localized URL path when available, otherwise fallback to a standard non-localized Next.js URL.
 *
 * By default relative URLs are returned (e.g. /en-us/contact-us) unless the `absolute` parameter is set to `true`.
 *
 * @param rewrites - An array of Next.js rewrite objects.
 * @param urlPath - A standard non-localized Next.js URL path without the locale prefix (e.g. `/contact-us`).
 * @param locale - The locale of the localized URL.
 * @param basePath - A path prefix for the Next.js application.
 * @param absolute - Returns the absolute URL, including the protocol and domain (e.g. https://example.com/en-us/contact-us).
 *
 * @returns The applicable URL (localized if available, otherwise non-localized).
 */
export function getApplicableUrl(
  rewrites: Rewrite[],
  urlPath: string,
  locale: string,
  basePath = '',
  absolute = false
): string {
  let applicableUrl;

  if (urlPath === '/') {
    applicableUrl = `/${locale}`; // Special rule for the homepage.
  } else {
    const isDynamicRoute = containsRouterQueries(urlPath);
    const searchablePath = isDynamicRoute ? routerQueriesToRewriteParameters(urlPath) : urlPath;
    const localizedUrlPath = getRewritesIndex(rewrites)?.[searchablePath]?.[locale];
    applicableUrl = localizedUrlPath
      ? isDynamicRoute
        ? rewriteParametersToRouterQueries(localizedUrlPath)
        : localizedUrlPath
      : `/${locale}${urlPath}`; // Fallback with the original URL path when not found.
  }

  // Set base path (https://nextjs.org/docs/api-reference/next.config.js/basepath) if present.
  if (basePath.length) {
    if (basePath[0] !== '/') {
      throw new Error(`Specified basePath has to start with a /, found "${basePath}"`);
    }
    applicableUrl = `${basePath}${applicableUrl}`;
  }

  // Set origin if an absolute URL is requested.
  if (absolute) {
    const origin = getOrigin();
    applicableUrl = `${origin}${applicableUrl}`;
  }

  return applicableUrl;
}
