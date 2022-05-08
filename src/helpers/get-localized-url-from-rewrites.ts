import type { Rewrite } from 'next/dist/lib/load-custom-routes';
import type { ParsedUrlQueryInput } from 'node:querystring';
import { UrlObject } from 'url';

import {
    containsQueryParameters, highlight, hydrateQueryParameters, log, queryToRewriteParameters,
    rewriteToQueryParameters, stripBasePath
} from '../';
import { Url } from '../types';
import { getOrigin } from './get-origin';
import { getRewritesIndex } from './get-rewrites-index';

/**
 * Get the localized URL path when available, otherwise fallback to a standard non-localized Next.js URL.
 *
 * @param rewrites - An array of Next.js rewrite objects.
 * @param url - A non-localized Next.js URL path without a locale prefix (e.g., `/contact-us`) or its equivalent using
 * a `UrlObject`.
 * @param locale - The locale of the localized URL.
 * @param absolute - Returns the absolute URL, including the protocol and domain (e.g., https://example.com/en-us/contact-us).
 * @param basePath - A path prefix for the Next.js application.
 * @param includeBasePath - Include Next.js' `basePath` in the returned URL. By default Next.js does not require it, but
 * if `absolute` is used, this will be forced to `true`.
 *
 * @returns The localized URL path when available, otherwise fallback to a standard non-localized Next.js URL.
 */
export function getLocalizedUrlFromRewrites(
  rewrites: Rewrite[],
  url: Url,
  locale: string | undefined,
  absolute = false,
  basePath: string,
  includeBasePath = false
): string {
  let urlPath = (
    (url as UrlObject).pathname !== undefined ? (url as UrlObject).pathname : url
  ) as string;
  let urlFragment = '';
  const urlComponents = urlPath.split('#');
  if (urlComponents.length !== 1) {
    urlPath = urlComponents.shift() as string;
    // No need to use `encodeURIComponent` as it is already handled by Next.js' <Link>.
    urlFragment = urlComponents.join('#');
  }

  /**
   * Non-localizable links.
   */
  if (/^(tel:|mailto:|http[s]?:\/\/)/i.test(urlPath)) {
    /**
     * Using URLs that do not require the router is not recommended by Next.js.
     *
     * @see https://github.com/vercel/next.js/issues/8555
     */
    log.warn(
      'using URLs that do not require the router is not recommended. Consider using a traditional <a> link instead to avoid Next.js issues.'
    );
    return urlPath;
  }

  if (locale === undefined) {
    log.warn(
      `a locale was not provided when trying to localize the following URL: ${highlight(urlPath)}`
    );
    return urlPath; // Next.js locales can be undefined when not configured.
  }

  // Set base path (https://nextjs.org/docs/api-reference/next.config.js/basepath) if present.
  if (basePath !== undefined && basePath !== '') {
    if (basePath[0] !== '/') {
      throw new Error(`Specified basePath has to start with a /, found "${basePath}"`);
    }
  }

  if (urlPath === '/') {
    urlPath = `${basePath}/${locale}`; // Special rule for the homepage.
  } else {
    if (urlPath.endsWith('/')) {
      // Next.js automatically normalize URLs and removes trailing slashes. We need to do the same to match localized URLs.
      urlPath = urlPath.slice(0, -1);
    }
    const isDynamicRoute = containsQueryParameters(urlPath);
    const searchableUrlPath = isDynamicRoute ? queryToRewriteParameters(urlPath) : urlPath;
    const rewriteUrlMatch = getRewritesIndex(rewrites, basePath)?.[searchableUrlPath]?.[locale];
    urlPath =
      rewriteUrlMatch !== undefined
        ? isDynamicRoute
          ? rewriteToQueryParameters(rewriteUrlMatch)
          : rewriteUrlMatch
        : `${basePath}/${locale}${urlPath}`; // Fallback with the original URL path when not found.
  }

  // Set origin if an absolute URL is requested.
  if (absolute) {
    const origin = getOrigin();
    urlPath = `${origin}${urlPath}`;
  }

  const localizedUrl = `${
    (url as UrlObject).query !== undefined
      ? hydrateQueryParameters(urlPath, (url as UrlObject).query as ParsedUrlQueryInput)
      : urlPath
  }${urlFragment ? `#${urlFragment}` : ''}`;

  return absolute || includeBasePath ? localizedUrl : stripBasePath(localizedUrl, basePath);
}
