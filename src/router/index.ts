import { GetServerSidePropsContext, GetStaticPropsContext } from 'next'
import { NextRouter, useRouter as useNextRouter } from 'next/router'
import { useMemo } from 'react'
import { getLocalesState, getNextLocalesState, highlight, LocalesState, log } from '..'
import { getMessages, slugify } from '../messages'

/**
 * Wrapper on top of Next.js' `useRouter` that returns the locales state used by `next-multilingual`.
 *
 * @returns An extended `NextRouter` using `next-multilingual`'s locales state.
 */
export function useRouter(): NextRouter & LocalesState {
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
  }, [nextRouter])
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
 * @param context - The context coming from `getStaticProps` or `getServerSideProps`.
 * @param routeParameterMessages - Messages functions for each route parameter.
 *
 * @returns A route parameters object.
 */
export function getLocalizedRouteParameters(
  context: GetStaticPropsContext | GetServerSidePropsContext,
  routeParameterMessages: RouteParameterMessages
): LocalizedRouteParameters {
  const { locale: currentLocale, locales } = getLocalesState(context as LocalesState)
  const routeParameters = context.params as RouteParameters
  const localizedRouteParameters: LocalizedRouteParameters = {}

  Object.entries(routeParameterMessages).forEach(([parameter, messages]) => {
    if (messages instanceof Function) {
      const key = messages(currentLocale).getRouteParameterKey(routeParameters[parameter]) as string
      locales.forEach((locale) => {
        localizedRouteParameters[locale] = localizedRouteParameters[locale] ?? {}
        localizedRouteParameters[locale][parameter] = slugify(messages(locale).format(key), locale)
      })
    } else {
      locales.forEach((locale) => {
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
