import type { Rewrite } from 'next/dist/lib/load-custom-routes'
import { highlight, isLocale, log } from '..'
import { LocalizedRouteParameters } from '../router'
import { getLastPathSegment, getPathWithoutLastSegment, sortUrls } from './paths-utils'

/** Track the `rewrites` arguments used when calling `getRewritesIndex` to automatically flush the cache. */
let lastRewrites: Rewrite[]

/** Static URL rewrite index cache to avoid non-required operations. */
let staticRewriteIndexCache: RewriteIndex
/** Dynamic URL rewrite index cache to avoid non-required operations. */
let dynamicRewriteIndexCache: RewriteIndex

/** The `RewriteIndex` is a simple object where the properties are non-localized URLs, and the values, `RewriteLocaleIndex` objects.  */
export type RewriteIndex = {
  [nonLocalizedUrl: string]: RewriteLocaleIndex
}

/** The `RewriteLocaleIndex` is a simple object where the properties are lowercased locales, and the values, localized URLs.  */
export type RewriteLocaleIndex = {
  [locale: string]: string
}

/**
 * Build cached indexes used to access all localized URLs.
 *
 * @param rewrites - An array of Next.js rewrite objects.
 * @param basePath - A path prefix for the Next.js application.
 */
const buildIndexes = (rewrites: Rewrite[], basePath?: string): void => {
  // Rewrites values can be refreshed as Next.js builds so we want to keep the cache updates.
  if (lastRewrites === rewrites) {
    return
  } else {
    // Track last `rewrites` to hit cache.
    lastRewrites = rewrites
  }

  const rewritesIndex: RewriteIndex = {}

  // Build localized URL objects.
  rewrites.forEach((rewrite) => {
    if (rewrite.locale !== false) {
      return // Only process `next-multilingual` rewrites.
    }
    const sourceUrlSegments = rewrite.source.split('/')
    const destinationUrlSegments = rewrite.destination.split('/')

    let urlLocale: string
    let nonLocalizedUrl: string
    let localizedUrl: string

    if (basePath) {
      if (basePath[0] !== '/') {
        throw new Error(`Specified basePath has to start with a /, found "${basePath}"`)
      }
      urlLocale = destinationUrlSegments[2]
      nonLocalizedUrl = `/${destinationUrlSegments.slice(3).join('/')}`
      localizedUrl = `/${sourceUrlSegments.slice(2).join('/')}`
    } else {
      urlLocale = destinationUrlSegments[1]
      nonLocalizedUrl = `/${destinationUrlSegments.slice(2).join('/')}`
      localizedUrl = `${sourceUrlSegments.join('/')}`
    }

    if (!isLocale(urlLocale)) {
      return // The URL must contain a valid locale.
    }

    if (!rewritesIndex[nonLocalizedUrl]) {
      rewritesIndex[nonLocalizedUrl] = {}
    }

    if (rewritesIndex[nonLocalizedUrl][urlLocale]) {
      log.warn(
        `rewrite collision found between ${highlight(
          rewritesIndex[nonLocalizedUrl][urlLocale]
        )} and ${highlight(localizedUrl)}`
      )
      return
    }

    // Add the index entry that allow direct localized URL access by using a non-localized URL and a locale.
    rewritesIndex[nonLocalizedUrl][urlLocale] = localizedUrl
  })

  // Add index pages for optional catch-all routes so that we can access them normally.
  for (const [nonLocalizedUrl, rewriteLocaleIndex] of Object.entries(rewritesIndex)) {
    const lastPathSegment = getLastPathSegment(nonLocalizedUrl)
    if (lastPathSegment.startsWith(':') && lastPathSegment.endsWith('*')) {
      const parentNonLocalizedUrl = getPathWithoutLastSegment(nonLocalizedUrl)
      if (!rewritesIndex[parentNonLocalizedUrl]) {
        rewritesIndex[parentNonLocalizedUrl] = {}
        for (const [locale, localizedUrl] of Object.entries(rewriteLocaleIndex)) {
          const parentLocalizedUrl = getPathWithoutLastSegment(localizedUrl)
          rewritesIndex[parentNonLocalizedUrl][locale] = parentLocalizedUrl
        }
      }
    }
  }

  // Make sure the index is in the right order when trying to match catch-all routes.
  const sortedRewritesIndex: RewriteIndex = {}
  Object.keys(rewritesIndex)
    .sort(sortUrls)
    .map((key) => (sortedRewritesIndex[key] = rewritesIndex[key]))

  // Split indexes by static and dynamic routes.
  const staticRewritesIndex: RewriteIndex = {}
  const dynamicRewritesIndex: RewriteIndex = {}

  Object.entries(sortedRewritesIndex).forEach(([nonLocalizedUrl, rewriteLocaleIndex]) => {
    const urlSegments = nonLocalizedUrl.split('/')
    if (urlSegments.some((urlSegment) => urlSegment.startsWith(':'))) {
      let regExpIndex = ''

      urlSegments.forEach((urlSegment) => {
        if (urlSegment) {
          if (urlSegment.startsWith(':')) {
            regExpIndex += urlSegment.endsWith('*') ? '/(.+)' : '/([^/]+)'
          } else {
            regExpIndex += `/${urlSegment}`
          }
        }
      })
      dynamicRewritesIndex[`^${regExpIndex}$`] = rewriteLocaleIndex
    } else {
      staticRewritesIndex[nonLocalizedUrl] = rewriteLocaleIndex
    }
  })

  // Save to the cache.
  staticRewriteIndexCache = staticRewritesIndex
  dynamicRewriteIndexCache = dynamicRewritesIndex
}

/**
 * Get a localized static URL.
 *
 * @param urlPath - The non-localized URL.
 * @param locale - The target locale of the URL.
 * @param rewrites - An array of Next.js rewrite objects.
 * @param basePath - A path prefix for the Next.js application.
 *
 * @returns A localized URL if available, otherwise an empty string.
 */
export const getLocalizedStaticUrl = (
  urlPath: string,
  locale: string,
  rewrites: Rewrite[],
  basePath?: string
): string => {
  buildIndexes(rewrites, basePath)
  // Because of the index, getting a static URL has been optimized to a O(1) operation.
  return staticRewriteIndexCache?.[urlPath]?.[locale] || ''
}

/**
 * Get a localized dynamic URL.
 *
 * @param urlPath - The non-localized URL.
 * @param locale - The target locale of the URL.
 * @param rewrites - An array of Next.js rewrite objects.
 * @param localizedRouteParameters - Localized route parameters, if the page is using a dynamic route.
 * @param basePath - A path prefix for the Next.js application.
 *
 * @returns A localized URL if available, otherwise an empty string.
 */
export const getLocalizedDynamicUrl = (
  urlPath: string,
  locale: string,
  rewrites: Rewrite[],
  localizedRouteParameters?: LocalizedRouteParameters,
  basePath?: string
): string => {
  buildIndexes(rewrites, basePath)

  // Try to get a matching URL from the index.
  const { indexMatch, localizedRewrite } = (() => {
    for (const [nonLocalizedUrlRegExp, rewriteLocaleIndex] of Object.entries(
      dynamicRewriteIndexCache
    )) {
      // Check if the rewrite regular expression matched the non-localized dynamic URL.
      const indexMatch = urlPath.match(new RegExp(nonLocalizedUrlRegExp))
      if (!indexMatch) {
        continue
      }

      indexMatch.shift() // Remove the full match (we only need groups).

      if (!rewriteLocaleIndex[locale]) {
        /**
         * Because we rely on localized URLs to get rewrites, if the localized URLs was indexed but has no
         * localization, either the localization is missing or the requested locale use the same doesn't
         * require localization (e.g. English).
         *
         * Because we have no way to know which one it is, we presume it's the latter
         */
        return { indexMatch, localizedRewrite: `/${locale}${urlPath}` }
      }
      return { indexMatch, localizedRewrite: rewriteLocaleIndex[locale] }
    }
    // The URL could not be found in the index.
    return { indexMatch: undefined, localizedRewrite: undefined }
  })()

  if (!indexMatch && !localizedRewrite) {
    // No localized URL can be found.
    return ''
  }

  const missingParameters: string[] = []
  let localizedDynamicUrl = ''

  localizedRewrite.split('/').forEach((urlSegment) => {
    if (urlSegment) {
      if (urlSegment.startsWith(':')) {
        const parameterName = urlSegment.endsWith('*')
          ? urlSegment.slice(1, -1)
          : urlSegment.slice(1)
        const localizedRouteParameter = localizedRouteParameters?.[locale]?.[parameterName]

        if (localizedRouteParameter) {
          // A localized route parameter has been found (most likely this is a URL from a language switcher).
          if (urlSegment.endsWith('*') && !Array.isArray(localizedRouteParameter)) {
            // The segment is a catch-all route but a 'string' was provided instead of an array.
            log.warn(
              `the route parameter ${highlight(parameterName)} in ${highlight(
                urlPath
              )} was provided as a ${highlight('string')} while an ${highlight(
                'array'
              )} was expected. Please correct the values in ${highlight(
                'getLocalizedRouteParameters'
              )} to avoid unexpected issues.`
            )
          } else if (!urlSegment.endsWith('*') && Array.isArray(localizedRouteParameter)) {
            // Wrong type for catch-all route.
            log.warn(
              `the route parameter ${highlight(parameterName)} in ${highlight(
                urlPath
              )} was provided as an ${highlight('array')} while a ${highlight(
                'string'
              )} was expected. Please correct the values in ${highlight(
                'getLocalizedRouteParameters'
              )} to avoid unexpected issues.`
            )
          }
          // Replace the route parameter by the localized value(s).
          indexMatch.shift()
          localizedDynamicUrl += `/${
            Array.isArray(localizedRouteParameter)
              ? localizedRouteParameter.join('/')
              : localizedRouteParameter
          }`
        } else {
          if (localizedRouteParameters && !urlSegment.endsWith('*')) {
            /**
             * Localized route parameters should only be used in language switchers, because we have 1 source URLs that we need
             * to translate into multiple languages. But in other cases, like <Link> components, we can specify the correctly
             * localized parameters directly in the non-localized URL.
             *
             * Note: catch all routes don't require parameters.
             */
            missingParameters.push(parameterName)
          }
          const parameterValue = indexMatch.shift() as string

          // Remove unused optional catch-all route if present.
          localizedDynamicUrl +=
            parameterValue && !(parameterValue.startsWith(':') && parameterValue.endsWith('*'))
              ? `/${parameterValue}`
              : ''
        }
      } else {
        localizedDynamicUrl += `/${urlSegment}`
      }
    }
  })

  if (missingParameters.length > 0) {
    log.warn(
      `unable to get a localized URL for ${highlight(
        urlPath
      )} because the following route parameter${
        missingParameters.length > 1 ? 's are' : ' is'
      } missing: ${highlight(missingParameters.join(','))}.`
    )
  }

  // Return the localized URL.
  return localizedDynamicUrl
}
