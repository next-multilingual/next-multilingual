import type { Rewrite } from 'next/dist/lib/load-custom-routes'
import { normalize } from 'node:path'
import { highlight, log } from '..'
import { LocalizedRouteParameters, routeToRewriteParameters } from '../router'
import { getOrigin } from './get-origin'
import { normalizePathSlashes, removeTrailingSlash } from './paths-utils'
import { getLocalizedDynamicUrl, getLocalizedStaticUrl } from './rewrites-urls'

/**
 * Get the localized URL path when available, otherwise fallback to a standard non-localized Next.js URL.
 *
 * @param rewrites - An array of Next.js rewrite objects.
 * @param url - A non-localized Next.js URL path without a locale prefix (e.g., `/contact-us`).
 * @param locale - The locale of the localized URL.
 * @param basePath - A path prefix for the Next.js application.
 * @param localizedRouteParameters - Localized route parameters, if the page is using a dynamic route.
 * @param absolute - Returns the absolute URL, including the protocol and domain (e.g., https://example.com/en-us/contact-us).
 * @param includeBasePath - Include Next.js' `basePath` in the returned URL. By default Next.js does not require it, but
 * if `absolute` is used, this will be forced to `true`.
 *
 * @returns The localized URL path when available, otherwise fallback to a standard non-localized Next.js URL.
 */
export function getLocalizedUrlFromRewrites(
  rewrites: Rewrite[],
  url: string,
  locale: string,
  basePath: string,
  localizedRouteParameters?: LocalizedRouteParameters,
  absolute = false,
  includeBasePath = false
): string {
  const origin = getOrigin()
  // Build a URL object to avoid parsing URLs.
  const urlObject = (() => {
    try {
      return new URL(url)
    } catch {
      try {
        return new URL(url, origin)
      } catch {
        return
      }
    }
  })()

  // Non-routable (localizable) URLs.
  if (!urlObject || urlObject.origin != origin) {
    const nonRoutableUrl = urlObject?.href || url
    /**
     * Using URLs that do not require the router with `<Link>` is not recommended by Next.js.
     *
     * @see https://github.com/vercel/next.js/issues/8555
     */
    log.warn(
      `used a ${highlight(
        '<Link>'
      )} component for a URL that does not require the router: ${highlight(
        nonRoutableUrl
      )}. Consider using a ${highlight('<a>')} HTML link instead to avoid unexpected issues.`
    )
    // Let Next.js handle non-routable URLs.
    return nonRoutableUrl
  }

  // We remove the trailing slash if present so that we can use the index.
  // Next.js' <Link> can add it back if the `trailingSlash` option is used.
  urlObject.pathname = removeTrailingSlash(urlObject.pathname)

  // Normalize the base path when configured.
  const normalizedBasePath =
    !basePath || basePath === '/' ? '' : normalizePathSlashes(normalize(basePath))

  // This is the applicable base path returned in the final URL.
  const applicableBasePath = !includeBasePath && !absolute ? '' : normalizedBasePath

  // The URL object already resolves the URL, so below are extra checks.
  const normalizedUrlPath = (() => {
    let pathname = urlObject.pathname
    /**
     * This is a "hack" to work around inconsistent client/server `asPath` values
     *
     * @see https://github.com/vercel/next.js/issues/41728
     */
    if (normalizedBasePath && typeof window === 'undefined') {
      const unexpectedPrefix = `${normalizedBasePath}/${locale}`
      if (pathname.startsWith(unexpectedPrefix)) {
        pathname = pathname.slice(unexpectedPrefix.length)
      }
    }
    return pathname === '/' ? '' : pathname // We never use "/" since we will add locale prefixes.
  })()

  const localizedUrlPath = (() => {
    if (!normalizedUrlPath) {
      return '' // No need to search the index for the homepage.
    }

    const localizedStaticUrlPath = getLocalizedStaticUrl(
      normalizedUrlPath,
      locale,
      rewrites,
      basePath
    )

    if (localizedStaticUrlPath) {
      return localizedStaticUrlPath
    }
    return getLocalizedDynamicUrl(
      routeToRewriteParameters(normalizedUrlPath),
      locale,
      rewrites,
      localizedRouteParameters,
      basePath
    )
  })()

  /**
   * Check if we found a URL in the index, otherwise use a fallback non-localized URL.
   *
   * Note that even if Next.js does not support non-ascii characters in filesystem routes,
   * it would be possible to have a site with multiple English variants that would all use
   * the non-localized routes and not required rewrite rules.
   *
   * This means that we cannot rely on the presence of a rewrite directive to know if a
   * localizable route is missing or not. Hence why we have no warning or errors below.
   */
  const applicableUrlPath = localizedUrlPath || `/${locale}${normalizedUrlPath}`

  // @todo: add query (?page=1) params (encodeURI because Next.js does not encode strings on its `<Link>` component)
  return `${absolute ? urlObject.origin : ''}${applicableBasePath}${applicableUrlPath}${
    urlObject.hash
  }`
}
