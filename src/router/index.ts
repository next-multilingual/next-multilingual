import { NextRouter, useRouter as useNextRouter } from 'next/router'
import { useMemo } from 'react'
import {
  getActualLocale,
  getActualLocales,
  getLocaleConfig,
  highlight,
  LocaleConfig,
  log,
} from '..'
import { getMessages, slugify } from '../messages'

/**
 * Wrapper on top of Next.js' `useRouter` to:
 *
 * - automatically overwrite the locale if it's using the default locale.
 * - make sure that locale configuration is never `undefined`.
 *
 * @returns An extended `NextRouter` using `next-multilingual`'s actual locale (and no `undefined` values).
 */
export function useRouter(): NextRouter & LocaleConfig {
  const router = useNextRouter()

  // Only recomputes if the router changes (useful if `useRouter` is called multiple times on the same page).
  return useMemo(() => {
    const localeConfig = getLocaleConfig(router.locale, router.defaultLocale, router.locales)
    // Automatically overwrites the locale if it's using the default locale.
    router.locale = getActualLocale(router.locale, router.defaultLocale, router.locales)
    // Leave the default locale intact (without `undefined`) so that we can still use the other "getActual" APIs.
    router.defaultLocale = localeConfig.defaultLocale
    return router as NextRouter & LocaleConfig
  }, [router])
}

/**
 * Hydrate a path back with its route parameters values.
 *
 * Missing route parameters will show warning messages and will be kept in their original format.
 *
 * @see https://nextjs.org/docs/routing/dynamic-routes
 *
 * @param path - A path containing "route parameters".
 * @param routeParameters - The route parameters.
 * @param suppressWarning - If set to true, will not display a warning message if the key is missing.
 *
 * @returns The hydrated path containing route parameters values instead of placeholders.
 */
export function hydrateRouteParameters(
  path: string,
  routeParameters: RouteParameters,
  suppressWarning = false
): string {
  const pathSegments = path.split('/')
  const missingParameters: string[] = []

  const hydratedPath = pathSegments
    .map((pathSegment) => {
      if (/^\[.+]$/.test(pathSegment)) {
        const parameterName = pathSegment.slice(1, -1)
        if (routeParameters[parameterName] !== undefined) {
          return routeParameters[parameterName]
        } else {
          missingParameters.push(parameterName)
        }
      }
      return pathSegment
    })
    .join('/')

  if (missingParameters.length > 0 && !suppressWarning) {
    log.warn(
      `unable to hydrate the path ${highlight(path)} because the following route parameter${
        missingParameters.length > 1 ? 's are' : ' is'
      } missing: ${highlight(missingParameters.join(','))}.`
    )
  }

  return hydratedPath
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
export function routeToRewriteParameters(path: string): string {
  return path
    .split('/')
    .map((pathSegment) => {
      if (/^\[.+]$/.test(pathSegment)) {
        return `:${pathSegment.slice(1, -1)}`
      }
      return pathSegment
    })
    .join('/')
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
export function rewriteToRouteParameters(path: string): string {
  return path
    .split('/')
    .map((pathSegment) => {
      if (pathSegment.startsWith(':')) {
        return `[${pathSegment.slice(1)}]`
      }
      return pathSegment
    })
    .join('/')
}

/**
 * Does a given path contain route parameters (using the bracket syntax)?
 *
 * @param path - A path containing route parameters.
 *
 * @returns True if the path contains route parameters, otherwise false.
 */
export function pathContainsParameters(path: string): boolean {
  return path.split('/').some((pathSegment) => /^\[.+]$/.test(pathSegment))
}

/**
 * Route parameters.
 *
 * @example { city: 'london', poi: 'palace-of-westminster'}
 */
export type RouteParameters = { [parameter: string]: string }

/**
 * Route parameters for all configured locales.
 *
 * @example { 'en-us': { city: 'london' }, 'fr-ca': { city: 'londres' } }
 */
export type LocalizedRouteParameters = { [locale: string]: RouteParameters }

/**
 * Get (route) parameters (using the bracket syntax) from a path.
 *
 * @param path - A path containing (route) parameters.
 *
 * @returns An array of (route) parameters or an empty array when not found.
 */
export function getParametersFromPath(path: string): string[] {
  const parameters = path.split('/').filter((pathSegment) => /^\[.+]$/.test(pathSegment))

  if (parameters === undefined) {
    return []
  }

  return parameters.map((parameter) => parameter.slice(1, -1))
}

/**
 * Messages functions for each route parameter.
 *
 * @example { city: getCityMessages }
 */
export type RouteParameterMessages = { [parameter: string]: typeof getMessages | string }

/**
 * Get route parameters for all configured locales.
 *
 * @param locale - The current locale from Next.js.
 * @param defaultLocale - The configured i18n default locale from Next.js.
 * @param locales - The configured i18n locales from Next.js.
 * @param routeParameters - The route parameters.
 * @param routeParameterMessages - Messages functions for each route parameter.
 *
 * @returns A route parameters object.
 */
export function getLocalizedRouteParameters(
  locale: string,
  defaultLocale: string,
  locales: string[],
  routeParameters: RouteParameters,
  routeParameterMessages: RouteParameterMessages
): LocalizedRouteParameters {
  const localizedRouteParameters: LocalizedRouteParameters = {}
  const actualLocale = getActualLocale(locale, defaultLocale, locales)
  const actualLocales = getActualLocales(locales, defaultLocale)

  Object.entries(routeParameterMessages).forEach(([parameter, messages]) => {
    if (messages instanceof Function) {
      const key = messages(actualLocale).getRouteParameterKey(routeParameters[parameter]) as string
      actualLocales.forEach((locale) => {
        localizedRouteParameters[locale] = localizedRouteParameters[locale] ?? {}
        localizedRouteParameters[locale][parameter] = slugify(messages(locale).format(key), locale)
      })
    } else {
      actualLocales.forEach((locale) => {
        localizedRouteParameters[locale] = localizedRouteParameters[locale] ?? {}
        localizedRouteParameters[locale][parameter] = messages
      })
    }
  })
  return localizedRouteParameters
}

/**
 * Strips the base path from a URL if present.
 *
 * @param url - The URL from which to strip the base path.
 * @param basePath - The base path to strip.
 *
 * @returns The URL without the base path if present.
 */
export function stripBasePath(url: string, basePath: string): string {
  if (url.startsWith(basePath)) {
    return url.replace(basePath, '')
  }
  return url
}
