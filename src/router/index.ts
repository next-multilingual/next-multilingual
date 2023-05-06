import { GetServerSidePropsContext, GetStaticPropsContext } from 'next'
import { NextRouter, useRouter as useNextRouter } from 'next/router'
import { fileURLToPath } from 'node:url'
import { useMemo } from 'react'
import {
  LocalesState,
  getLocalesState,
  getNextLocalesState,
  highlight,
  highlightFilePath,
  log,
} from '..'
import {
  getLastPathSegment,
  getPathWithoutLastSegment,
  normalizePagesFilePath,
} from '../helpers/paths-utils'
import { GetMessagesFunction, slugify } from '../messages'

/**
 * Wrapper on top of Next.js' `useRouter` that returns the locales state used by `next-multilingual`.
 *
 * @returns An extended `NextRouter` using `next-multilingual`'s locales state.
 */
export const useRouter = (): NextRouter & LocalesState => {
  const nextRouter = useNextRouter()

  // Only recomputes if the router changes (useful if `useRouter` is called multiple times on the same page).
  return useMemo(() => {
    const router = { ...nextRouter } // Clone the object.
    const { locale, locales, defaultLocale } = getLocalesState(getNextLocalesState(router))
    // Override the router with real values so that they can be used everywhere transparently.
    router.locale = locale
    router.locales = locales
    router.defaultLocale = defaultLocale
    return router as NextRouter & LocalesState
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextRouter, nextRouter.locale, nextRouter.defaultLocale])
}

/**
 * Hydrate a path back with its route parameters values.
 *
 * Missing route parameters will show warning messages and will be kept in their original format.
 *
 * @see https://nextjs.org/docs/routing/dynamic-routes
 *
 * @param pathname - Next.js' router `pathname` value.
 * @param routeParameters - The route parameters (e.g., `{city: 'london'}`).
 * @param suppressWarning - If set to true, will not display a warning message if the key is missing.
 *
 * @returns The hydrated path containing route parameters values instead of placeholders.
 */
export const hydrateRouteParameters = (
  pathname: string,
  routeParameters: RouteParameters,
  suppressWarning = false
): string => {
  const pathSegments = pathname.split('/')
  const missingParameters: string[] = []

  const hydratedPath = pathSegments
    .map((pathSegment) => {
      if (isDynamicRoute(pathSegment)) {
        const parameterName = getDynamicRouteParameterName(pathSegment)
        if (routeParameters?.[parameterName]) {
          const routeParameter = routeParameters[parameterName]
          return Array.isArray(routeParameter) ? routeParameter.join('/') : routeParameter
        } else {
          missingParameters.push(parameterName)
        }
      }
      return pathSegment
    })
    .join('/')

  if (missingParameters.length > 0) {
    // If there is only 1 missing parameter and it is an optional catch-all dynamic route, we can remove the parameter.
    if (missingParameters.length === 1 && isOptionalCatchAllDynamicRoute(pathname)) {
      const parameterName = getDynamicRouteParameterName(pathname)
      if (
        missingParameters[0] === parameterName &&
        (!routeParameters || Object.entries(routeParameters).length === 0)
      ) {
        return getPathWithoutLastSegment(hydratedPath)
      }
    }
    if (!suppressWarning) {
      log.warn(
        `unable to hydrate the path ${highlight(pathname)} because the following route parameter${
          missingParameters.length > 1 ? 's are' : ' is'
        } missing: ${highlight(missingParameters.join(','))}.`
      )
    }
  }

  return hydratedPath
}

/**
 * Is a URL segment or it's last segment a Next.js dynamic route?
 *
 * @param pathname - An individual URL segment or a URL path following the `useRouter().pathname` square bracket format.
 *
 * @returns True if the URL segment or it's last segment is a Next.js dynamic route, otherwise false.
 */
export const isDynamicRoute = (pathname: string): boolean => {
  const lastUrlPathSegment = getLastPathSegment(pathname)
  return lastUrlPathSegment.startsWith('[') && lastUrlPathSegment.endsWith(']')
}

/**
 * Is a URL segment or it's last segment a Next.js catch all dynamic route?
 *
 * @param pathname - An individual URL segment or a URL path following the `useRouter().pathname` square bracket format.
 *
 * @returns True if the URL segment or it's last segment is a catch-all Next.js dynamic route, otherwise false.
 */
export const isCatchAllDynamicRoute = (pathname: string): boolean => {
  const lastUrlPathSegment = getLastPathSegment(pathname)
  return lastUrlPathSegment.startsWith('[...') && lastUrlPathSegment.endsWith(']')
}

/**
 * Is a URL segment or it's last segment an optional catch-all Next.js dynamic route?
 *
 * @param pathname - An individual URL segment or a URL path following the `useRouter().pathname` square bracket format.
 *
 * @returns True if the URL segment or it's last segment is a optional catch-all Next.js dynamic route, otherwise false.
 */
export const isOptionalCatchAllDynamicRoute = (pathname: string): boolean => {
  const lastUrlPathSegment = getLastPathSegment(pathname)
  return lastUrlPathSegment.startsWith('[[...') && lastUrlPathSegment.endsWith(']]')
}

/**
 * Is a given path an optional catch all dynamic route that is only missing it's optional parameter?
 *
 * @param pathname - An individual URL segment or a URL path following the `useRouter().pathname` square bracket format.
 *
 * @returns True if the URL segment or it's last segment is a optional catch-all Next.js dynamic route, otherwise false.
 */
export const missingParameterIsOptional = (pathname: string): boolean => {
  // If there is no missing parameter or there is more than one, then it's not only missing the optional parameter.
  if (getParameterNames(pathname).length != 1) {
    return false
  }
  return isOptionalCatchAllDynamicRoute(pathname)
}

/**
 * Convert a path using "route parameters" to "rewrite parameters".
 *
 * Next.js' router uses the bracket format (e.g., `/[example]`) to identify dynamic routes, called "route parameters". The
 * rewrite statements use the colon format (e.g., `/:example`), called "rewrite parameters".
 *
 * @see https://nextjs.org/docs/routing/dynamic-routes
 * @see https://nextjs.org/docs/api-reference/next.config.js/rewrites
 *
 * @param path - A path containing "route parameters".
 *
 * @returns The path converted to the "rewrite parameters" format.
 */
export const routeToRewriteParameters = (path: string): string =>
  path
    .split('/')
    .map((pathSegment) => {
      if (isDynamicRoute(pathSegment)) {
        const parameterName = getDynamicRouteParameterName(pathSegment)
        if (isOptionalCatchAllDynamicRoute(pathSegment) || isCatchAllDynamicRoute(pathSegment)) {
          return `:${parameterName}*`
        }
        return `:${parameterName}`
      }
      return pathSegment
    })
    .join('/')

/**
 * Get the dynamic router parameter name of a URL path's last segment.
 *
 * @param urlPath - A url path.
 *
 * @returns The parameter name if present, otherwise an empty string.
 */
export const getDynamicRouteParameterName = (urlPath: string): string => {
  const lastUrlPathSegment = getLastPathSegment(urlPath)

  // Optional catch all dynamic route parameter (e.g., `/path/[[...param]]`).
  const optionalCatchAllDynamicRouteMatch = lastUrlPathSegment.match(
    /^\[\[\.{3}(?<parameter>.+)]]$/
  )
  if (optionalCatchAllDynamicRouteMatch?.groups) {
    return optionalCatchAllDynamicRouteMatch.groups.parameter
  }

  // Catch all dynamic route parameter (e.g., `/path/[...param]`).
  const catchAllDynamicRouteMatch = lastUrlPathSegment.match(/^\[\.{3}(?<parameter>.+)]$/)
  if (catchAllDynamicRouteMatch?.groups) {
    return catchAllDynamicRouteMatch.groups.parameter
  }

  // Dynamic route parameter (e.g., `/path/[param]`).
  const dynamicRouteMatch = lastUrlPathSegment.match(/^\[(?<parameter>.+)]$/)
  if (dynamicRouteMatch?.groups) {
    return dynamicRouteMatch.groups.parameter
  }
  return ''
}

/**
 * Convert a path using "rewrite parameters" to "route parameters".
 *
 * Next.js' router uses the bracket format (e.g., `/[example]`) to identify dynamic routes, called "route parameters". The
 * rewrite statements use the colon format (e.g., `/:example`), called "rewrite parameters".
 *
 * @see https://nextjs.org/docs/routing/dynamic-routes
 * @see https://nextjs.org/docs/api-reference/next.config.js/rewrites
 *
 * @param path - A path containing "rewrite parameters".
 *
 * @returns The path converted to the "router queries" format.
 */
export const rewriteToRouteParameters = (path: string): string =>
  path
    .split('/')
    .map((pathSegment) => {
      if (pathSegment.startsWith(':')) {
        if (pathSegment.endsWith('*')) {
          return `[[...${pathSegment.slice(1, -1)}]]`
        }
        return `[${pathSegment.slice(1)}]`
      }
      return pathSegment
    })
    .join('/')

/**
 * Does a given path contain route parameters (using the bracket syntax)?
 *
 * @param path - A path containing route parameters.
 *
 * @returns True if the path contains route parameters, otherwise false.
 */
export const pathContainsParameters = (path: string): boolean =>
  path.split('/').some((pathSegment) => isDynamicRoute(pathSegment))

/**
 * Route parameters.
 *
 * @example { country: 'canada', place: ['toronto', 'downtown'] } // This matches `/places/canada/toronto/downtown` for `/places/[country]/[...place]`
 */
export type RouteParameters = { [parameter: string]: RouteParameter | CatchAllRouteParameter }

/**
 * Route parameters for a single path segment.
 *
 * @example { city: 'london', poi: 'palace-of-westminster'} // This matches `/places/london/palace-of-westminster` for `/places/[city]/[poi]`
 */
export type RouteParameter = string

/**
 * Catch-all route parameter.
 *
 * @example { place: ['canada', 'toronto'] } // This matches `/places/canada/toronto` for `/places/[...place]`
 */
export type CatchAllRouteParameter = string[]

/**
 * Route parameters for all configured locales.
 *
 * @example { 'en-us': { city: 'london' }, 'fr-ca': { city: 'londres' } }
 */
export type LocalizedRouteParameters = { [locale: string]: RouteParameters }

/**
 * Get the parameter names from a Next.js router `pathname`.
 *
 * @param pathname - A Next.js router `pathname`.
 *
 * @returns An array of parameters name or an empty array when not found.
 */
export const getParameterNames = (pathname: string): string[] => {
  const segmentsWithParameter = pathname
    .split('/')
    .filter((pathSegment) => isDynamicRoute(pathSegment))

  if (segmentsWithParameter === undefined) {
    return []
  }

  return segmentsWithParameter.map((segmentWithParameter) =>
    getDynamicRouteParameterName(segmentWithParameter)
  )
}

/**
 * The messages associated with every route parameter.
 *
 * @example { country: 'Canada', city: getCityMessages, population: 1234 }
 */
export type RouteParameterMessages = {
  [parameter: string]: RouteParameterMessagesValue
}

/**
 * The possible values of a `RouteParameterMessages`.
 *
 * @example { country: 'Canada', city: getCityMessages, population: 1234 }
 */
export type RouteParameterMessagesValue =
  | string
  | number
  | GetMessagesFunction
  | (GetMessagesFunction | string | number)[]

/**
 * Get an individual localized route parameter.
 *
 * @param currentLocale - The current Next.js page's locale.
 * @param locale - The locale of the route parameter.
 * @param parameterName - The name of the parameter.
 * @param parameterValue - The parameter's value.
 * @param parameterMessagesValue  - The parameter's messages value.
 */
const getLocalizedRouteParameter = (
  currentLocale: string,
  locale: string,
  parameterName: string,
  parameterValue: string,
  parameterMessagesValue: RouteParameterMessagesValue
): string => {
  // If the current locale is being requested, we already know the parameter value.
  if (currentLocale === locale) {
    return parameterValue
  }

  // Static values.
  if (['string', 'number'].includes(typeof parameterMessagesValue)) {
    return String(parameterMessagesValue)
  }

  // `getMessages` function.
  if (parameterMessagesValue instanceof Function) {
    const currentLocaleMessages = parameterMessagesValue(currentLocale)
    const key = currentLocaleMessages.getRouteParameterKey(parameterValue)

    if (!key) {
      log.warn(
        `unable to get localized route parameters for ${highlight(
          parameterName
        )} because no message matches the route parameters "${highlight(
          parameterValue
        )}" in ${highlightFilePath(currentLocaleMessages.messagesFilePath)}.`
      )
      return ''
    }

    const messages = parameterMessagesValue(locale)
    const slug = key ? slugify(messages.format(key), locale) : ''

    if (!slug) {
      log.warn(
        `unable to get localized route parameters for ${highlight(
          parameterName
        )} the message for key ${highlight(key)} is missing from ${highlightFilePath(
          messages.messagesFilePath
        )}.`
      )
      return ''
    }
    return slug
  }
  return ''
}

/**
 * Get route parameters for all configured locales.
 *
 * @param context - The context coming from `getStaticProps` or `getServerSideProps`.
 * @param routeParameterMessages - Messages functions for each route parameter.
 * @param importMetaUrl - The file URL coming from `import.meta.url`.
 *
 * @returns A route parameters object.
 */
export const getLocalizedRouteParameters = (
  context: GetStaticPropsContext | GetServerSidePropsContext,
  routeParameterMessages: RouteParameterMessages,
  importMetaUrl: string
): LocalizedRouteParameters => {
  const { locale: currentLocale, locales } = getLocalesState(context as LocalesState)
  const routeParameters = context.params as RouteParameters
  const localizedRouteParameters: LocalizedRouteParameters = {}

  // Convert `import.meta.url` to a page file path.
  let pathname = normalizePagesFilePath(fileURLToPath(importMetaUrl).replace(process.cwd(), ''))

  if (isOptionalCatchAllDynamicRoute(pathname)) {
    const parameterNames = getParameterNames(pathname)
    const optionalParameterName = parameterNames.at(-1)

    if (!optionalParameterName || !routeParameters?.[optionalParameterName]) {
      if (parameterNames.length <= 1) {
        // Optional catch-all route that has no parent dynamic route and no parameter are treated like static routes.
        return {}
      }
      // No need to keep the optional segment if it has no values.
      pathname = getPathWithoutLastSegment(pathname)
    }
  }

  for (const [parameterName, parameterValue] of Object.entries(routeParameters)) {
    const parameterMessagesValue = routeParameterMessages[parameterName]

    if (!parameterMessagesValue) {
      log.warn(
        `unable to get localized route parameters for ${highlight(
          parameterName
        )} in ${highlightFilePath(pathname)} because the message was not provided.`
      )
      continue
    }

    if (Array.isArray(parameterValue)) {
      // Catch-all Dynamic routes.
      if (!Array.isArray(parameterMessagesValue)) {
        log.warn(
          `unable to get the localized catch-all route parameters for ${highlight(
            parameterName
          )} in ${highlightFilePath(pathname)} because the messages were not provided.`
        )
        continue
      }

      // Check that each dynamic segment of the path have messages.
      const routeParameterLength = parameterValue.length
      const routeParameterMessagesValueLength = parameterMessagesValue.length
      if (routeParameterLength > routeParameterMessagesValueLength) {
        log.warn(
          `unable to get the localized catch-all route parameters for ${highlight(
            parameterName
          )} in ${highlightFilePath(pathname)} because the number of provided messages (${highlight(
            routeParameterMessagesValueLength
          )}) does not match the number of dynamic path segments (${highlight(
            routeParameterLength
          )}).`
        )
        continue
      }

      // Once types have been verified, set the localized route parameters for each segment.
      for (let depth = 0; parameterValue[depth]; depth++) {
        locales.forEach((locale) => {
          localizedRouteParameters[locale] = localizedRouteParameters[locale] ?? {}
          localizedRouteParameters[locale][parameterName] =
            localizedRouteParameters[locale][parameterName] ?? []

          const localizedRouteParameter = getLocalizedRouteParameter(
            currentLocale,
            locale,
            parameterName,
            parameterValue[depth],
            parameterMessagesValue[depth]
          )

          if (localizedRouteParameter) {
            void (localizedRouteParameters[locale][parameterName] as string[]).push(
              localizedRouteParameter
            )
          }
        })
      }
    } else {
      // Patch-matching (non-catch-all) dynamic routes.
      locales.forEach((locale) => {
        localizedRouteParameters[locale] = localizedRouteParameters[locale] ?? {}
        const localizedRouteParameter = getLocalizedRouteParameter(
          currentLocale,
          locale,
          parameterName,
          parameterValue,
          parameterMessagesValue
        )
        if (localizedRouteParameter) {
          localizedRouteParameters[locale][parameterName] = localizedRouteParameter
        }
      })
    }
  }

  return localizedRouteParameters
}
