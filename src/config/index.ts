import CheapWatch from 'cheap-watch'
import type { NextConfig } from 'next'
import type { Redirect, Rewrite } from 'next/dist/lib/load-custom-routes'
import type { WebpackConfigContext } from 'next/dist/server/config-shared'
import { existsSync, Stats, utimesSync } from 'node:fs'
import type Webpack from 'webpack'
import { isLocale, LocalesConfig, log, normalizeLocale } from '../'
import { PAGE_FILE_EXTENSIONS, sortUrls } from '../helpers/paths-utils'
import { getMultilingualRoutes, MultilingualRoute } from '../helpers/server/get-multilingual-routes'
import { getSourceFilePath, keySegmentRegExp, keySegmentRegExpDescription } from '../messages'
import { routeToRewriteParameters } from '../router'

/**
 * Next.js did not define any types for its Webpack configs.
 *
 * @see https://github.com/vercel/next.js/blob/canary/packages/next/compiled/webpack/webpack.d.ts
 * @see https://github.com/vercel/next.js/blob/60c8e5c29e4da99ac1aa458b1ba3bdf829111115/packages/next/server/config-shared.ts#L67
 */
export interface WebpackContext extends WebpackConfigContext {
  webpack: typeof Webpack
}

/**
 * Is `next-multilingual` running in debug mode?
 *
 * The current implementation only works on the server side.
 *
 * @returns True when running in debug mode, otherwise false.
 */
export const isInDebugMode = (): boolean => {
  if (typeof process !== 'undefined' && process?.env?.nextMultilingualDebug) {
    return true
  }
  return false
}

export class Config {
  /** The locales specified in the configuration. */
  private readonly locales: string[]
  /** The locales specified in the configuration. */
  private readonly defaultLocale: string
  /** The locales used by the Next.js (this includes the "fake default locale"). */
  private readonly nextJsLocales: string[]
  /** The default locale used by the Next.js (this is a fake locale that is only used to bypass Next.js limitations). */
  private readonly nextJsDefaultLocale: string
  /** The Next.js application's multilingual routes. */
  private routes: MultilingualRoute[]

  /**
   * A multilingual configuration handler.
   *
   * @param applicationId - The unique application identifier that will be used as a messages key prefix.
   * @param locales - The locales of the application (only BCP 47 language tags following the `language`-`country` format are accepted).
   * @param defaultLocale - The default locale of the application (only BCP 47 language tags following the `language`-`country` format are accepted).
   * @param debug - Enable debug mode to see extra information about `next-multilingual`.
   *
   * @throws Error when one of the arguments is invalid.
   */
  constructor(applicationId: string, locales: string[], defaultLocale: string, debug = false) {
    // Set the application identifier if valid.
    if (!keySegmentRegExp.test(applicationId)) {
      throw new Error(
        `invalid application identifier '${applicationId}'. Application identifiers ${keySegmentRegExpDescription}.`
      )
    }

    // Add `applicationId` to environment variables so that it is available at build time (by Babel), without extra config.
    process.env.nextMultilingualApplicationId = applicationId

    // Verify if the locales are valid.
    locales.forEach((locale) => {
      if (!isLocale(locale)) {
        throw new Error(
          `invalid locale '${locale}': only BCP 47 languages tags following the 'language'-'country' format are accepted`
        )
      }
    })
    if (!isLocale(defaultLocale)) {
      throw new Error(
        `invalid default locale '${defaultLocale}': only BCP 47 languages tags following the 'language'-'country' format are accepted`
      )
    }

    // Set the actual desired locales of the multilingual application.
    this.locales = locales.map((locale) => normalizeLocale(locale))
    this.defaultLocale = normalizeLocale(defaultLocale)

    // Make sure the default locale is part of the locales.
    if (!this.locales.includes(this.defaultLocale)) {
      throw new Error(
        `the default '${
          this.defaultLocale
        }' provided is not included in your locales: ${this.locales.join(', ')}`
      )
    }

    // By convention, the first locale should be the default locale.
    this.locales = this.locales.sort((locale) => (locale === this.defaultLocale ? -1 : 0))

    // The `mul` (multilingual) default locale is required for dynamic locale resolution for requests on `/`.
    this.nextJsDefaultLocale = 'mul'
    this.nextJsLocales = [this.nextJsDefaultLocale, ...this.locales]

    // Set locales information so we can easily access it from the server from anywhere.
    process.env.nextMultilingualLocales = this.locales
      .map((locale) => locale.toLocaleLowerCase())
      .join(',')
    process.env.nextMultilingualDefaultLocale = this.defaultLocale.toLowerCase()

    this.routes = getMultilingualRoutes(this.locales)

    // During development, add an extra watcher to trigger recompile when a `.properties` file changes.
    if (process.env.NODE_ENV === 'development') {
      let routesSnapshot = this.routes

      const watch = new CheapWatch({
        dir: process.cwd(),
        filter: ({ path, stats }: { path: string; stats: Stats }) =>
          (stats.isFile() && path.includes('.properties')) ||
          (stats.isDirectory() && !path.includes('node_modules') && !path.includes('.next')),
      })

      void watch.init()

      watch.on('+', ({ path, stats }: { path: string; stats: Stats }) => {
        routesSnapshot = this.recompileSourceFile(path, stats, routesSnapshot)
      })
      watch.on('-', ({ path, stats }: { path: string; stats: Stats }) => {
        routesSnapshot = this.recompileSourceFile(path, stats, routesSnapshot)
      })
    }

    // Check if debug mode was enabled.
    if (debug) {
      process.env.nextMultilingualDebug = 'true' // Set flag on the server to re-use in other modules.
      console.log('==== ROUTES ====')
      console.dir(this.getRoutes(), { depth: undefined })
      console.log('==== REWRITES ====')
      console.dir(this.getRewrites(), { depth: undefined })
      console.log('==== REDIRECTS ====')
      console.dir(this.getRedirects(), { depth: undefined })
    }
  }

  /**
   * Force recompile a source file when a message file is modified.
   *
   * @param messagesFilePath - The file path of a message file.
   * @param messagesFileStats - The file stats of the message file.
   * @param routesSnapshot - The previous snapshot of routes to detect changes.
   *
   * @returns The most recent route snapshot.
   */
  private recompileSourceFile(
    messagesFilePath: string,
    messagesFileStats: Stats,
    routesSnapshot: MultilingualRoute[]
  ): MultilingualRoute[] {
    if (!messagesFileStats.isFile()) return routesSnapshot

    for (const pageFileExtension of PAGE_FILE_EXTENSIONS) {
      const sourceFilePath = getSourceFilePath(messagesFilePath, pageFileExtension)

      if (existsSync(sourceFilePath)) {
        // "touch" the file without any changes to trigger recompile.
        utimesSync(sourceFilePath, new Date(), new Date())
        const currentRoutes = getMultilingualRoutes(this.locales)
        if (JSON.stringify(currentRoutes) !== JSON.stringify(routesSnapshot)) {
          log.warn(
            `Found a change impacting localized URLs. Restart the server to see the changes in effect.`
          )
          return currentRoutes // Update snapshot to avoid logging all subsequent changes.
        }
        break
      }
    }
    return routesSnapshot
  }

  /**
   * Get the the multilingual routes.
   *
   * @returns The multilingual routes.
   */
  public getRoutes(): MultilingualRoute[] {
    return this.routes
  }

  /**
   * Get the URL locale prefixes.
   *
   * @return The locales prefixes, all in lowercase.
   */
  public getUrlLocalePrefixes(): string[] {
    return this.nextJsLocales.map((locale) => locale.toLowerCase())
  }

  /**
   * Get the URL default locale prefix.
   *
   * @return The default locale prefix, in lowercase.
   */
  public getDefaultUrlLocalePrefix(): string {
    return this.nextJsDefaultLocale.toLowerCase()
  }

  /**
   * Get path that is usable in a Next.js rewrite configuration.
   *
   * @param urlPath - The URL path (excluding the locale from the path).
   * @param locale - The locale of the path.
   * @param encode - Set to `true` to return an encode URL (by default it's not encoded)
   * @param normalizeForm - The normalization form to use (default is NFC as per https://tools.ietf.org/html/rfc3987#section-3.1).
   *
   * @returns The path that is usable in a Next.js rewrite configuration.
   */
  private getRewritePath(
    urlPath: string,
    locale?: string,
    encode = false,
    normalizeForm: 'NFC' | 'NFD' | 'NFKC' | 'NFKD' = 'NFC'
  ): string {
    let normalizedUrlPath = (() => {
      const normalizedSegments: string[] = []
      urlPath.split('/').forEach((urlPathSegment) => {
        if (urlPathSegment.startsWith(':')) {
          // Preserve casing for dynamic route variable names.
          normalizedSegments.push(urlPathSegment)
        } else {
          // Normalize the form and also the casing.
          normalizedSegments.push(urlPathSegment.normalize(normalizeForm).toLocaleLowerCase(locale))
        }
      })
      return `${locale ? `/${locale.toLowerCase()}` : ''}${normalizedSegments.join('/')}`
    })()

    if (encode) {
      normalizedUrlPath = encodeURI(normalizedUrlPath)
    }

    // Need to unescape both rewrite and route parameters since we use the same method in `getRedirects`.
    normalizedUrlPath = normalizedUrlPath
      .split('/')
      .map((pathSegment) => {
        const decodedPathSegment = decodeURI(pathSegment)
        // Unescape both rewrite parameters (e.g., `/:example`) or route parameters (e.g., `/[example]`) if present.
        if (
          decodedPathSegment.startsWith(':') ||
          (decodedPathSegment.startsWith('[') && decodedPathSegment.endsWith(']'))
        ) {
          return decodedPathSegment
        }
        return pathSegment
      })
      .join('/')

    return routeToRewriteParameters(normalizedUrlPath)
  }

  /**
   * Get Next.js rewrites directives.
   *
   * @returns An array of Next.js `Rewrite` objects.
   */
  public getRewrites(): Rewrite[] {
    const rewrites: Rewrite[] = []
    for (const route of this.routes) {
      for (const locale of this.locales) {
        const source = this.getRewritePath(route.getLocalizedUrlPath(locale), locale, true)
        const destination = this.getRewritePath(route.nonLocalizedUrlPath, locale)

        if (source !== destination) {
          rewrites.push({
            source,
            destination,
            locale: false,
          })
        }
      }
    }

    return rewrites.sort(sortRewritesDirectives)
  }

  /**
   * Get Next.js redirects directives.
   *
   * @returns An array of Next.js `Redirect` objects.
   */
  public getRedirects(): Redirect[] {
    const redirects: Redirect[] = []

    const rewrites = this.getRewrites()
    for (const rewrite of rewrites) {
      const canonical = rewrite.source
      const decodedSource = decodeURI(canonical).normalize('NFC')
      const alreadyIncluded = [canonical]

      for (const alternative of [
        decodedSource, // UTF-8
        this.getRewritePath(decodedSource, undefined, true, 'NFD'),
        this.getRewritePath(decodedSource, undefined, true, 'NFKC'),
        this.getRewritePath(decodedSource, undefined, true, 'NFKD'),
      ]) {
        if (!alreadyIncluded.includes(alternative) && canonical !== alternative) {
          redirects.push({
            source: alternative,
            destination: canonical,
            locale: false,
            permanent: true,
          })
          alreadyIncluded.push(alternative)
        }
      }
    }
    return redirects
  }
}

/**
 * Handles the Webpack configuration.
 *
 * @param config - The Webpack configuration options.
 * @param context - The Webpack context
 *
 * @returns A Webpack configuration object.
 */
export const webpackConfigurationHandler = (
  config: Webpack.Configuration,
  context: WebpackContext
): Webpack.Configuration => {
  if (context.isServer) {
    // Override APIs with SSR-specific versions that use different ways to get URLs.
    const alias = config.resolve?.alias as { [index: string]: string }
    // eslint-disable-next-line unicorn/prefer-module
    alias['next-multilingual/head$'] = require.resolve('next-multilingual/head/ssr')
    // eslint-disable-next-line unicorn/prefer-module
    alias['next-multilingual/link$'] = require.resolve('next-multilingual/link/ssr')
    // eslint-disable-next-line unicorn/prefer-module
    alias['next-multilingual/url$'] = require.resolve('next-multilingual/url/ssr')
  }

  /**
   * Add support for the `node:` scheme available since Node.js 16.
   *
   * `next-multilingual` uses the `node:` scheme to increase code clarity.
   *
   * @see https://github.com/webpack/webpack/issues/13290
   */
  config.plugins = config.plugins ?? []
  config.plugins.push(
    new context.webpack.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
      resource.request = resource.request.replace(/^node:/, '')
    })
  )

  return config
}

/**
 * Returns the Next.js multilingual config.
 *
 * @param applicationId - The unique application identifier that will be used as a messages key prefix.
 * @param locales - The locales of the application (only BCP 47 language tags following the `language`-`country` format are accepted).
 * @param defaultLocale - The default locale of the application (only BCP 47 language tags following the `language`-`country` format are accepted).
 * @param options - Next.js configuration options.
 *
 * @return The Next.js configuration.
 *
 * @throws Error when one of the arguments is invalid.
 */
export const getConfig = (
  applicationId: string,
  locales: string[],
  defaultLocale: string,
  options?: (NextConfig & { debug?: true }) | ((phase: string, defaultConfig: NextConfig) => void)
): NextConfig => {
  if (options instanceof Function) {
    throw new Error('Function config is not supported. Please use the `Config` object instead')
  }

  if (options !== undefined) {
    // Check if option is unsupported.
    const unsupportedOptions = ['env', 'i18n', 'webpack', 'rewrites', 'redirects']
    unsupportedOptions.forEach((option) => {
      if (options[option] !== undefined) {
        throw new Error(
          `the \`${option}\` option is not supported by \`getConfig\`. Please use the \`Config\` object instead`
        )
      }
    })
  }

  const nextConfig = { ...options } ?? {} // Clone options or create an empty config.
  const debug = ((): boolean => {
    if (nextConfig.debug) {
      delete nextConfig.debug // Delete this from the config since it's not a valid option.
      return true
    }
    return false
  })()
  const config = new Config(applicationId, locales, defaultLocale, debug)

  // Sets lowercase locales used as URL prefixes, including the default 'mul' locale used for language detection.
  nextConfig.i18n = {
    locales: config.getUrlLocalePrefixes(),
    defaultLocale: config.getDefaultUrlLocalePrefix(),
    localeDetection: false, // This is important to use the improved language detection feature.
  }

  // Add strict mode by default.
  if (nextConfig?.reactStrictMode !== false) {
    nextConfig.reactStrictMode = true
  }

  if (nextConfig?.experimental?.esmExternals !== undefined) {
    /* This is required since Next.js 11.1.3-canary.69 until we support ESM. */
    throw new Error(
      'the `esmExternals` option is not supported by `next-multilingual` until we support ESM'
    )
  }
  if (nextConfig.experimental && typeof nextConfig.experimental !== 'object') {
    throw new Error('invalid value for the `experimental` option')
  }
  if (nextConfig.experimental) {
    nextConfig.experimental.esmExternals = false
  } else {
    nextConfig.experimental = {
      esmExternals: false,
    }
  }

  // Set the Webpack configuration handler.
  nextConfig.webpack = webpackConfigurationHandler

  // Sets localized URLs as rewrites rules.
  nextConfig.rewrites = async () => {
    return await Promise.resolve(config.getRewrites())
  }

  // Sets redirect rules to normalize URL encoding.
  nextConfig.redirects = async () => {
    return await Promise.resolve(config.getRedirects())
  }

  return nextConfig
}

/**
 * The `Rewrite` directives needs to be in descending order from the longest path depths to the shortest.
 *
 * @param referenceRewrite - The reference `Rewrite` object.
 * @param comparedRewrite - The `Rewrite` object being compared.
 *
 * @returns The values expected by a sorting callback function.
 */
export const sortRewritesDirectives = (
  referenceRewrite: Rewrite,
  comparedRewrite: Rewrite
): number => {
  return sortUrls(referenceRewrite.destination, comparedRewrite.destination)
}

// Locale cache to avoid recomputing the values multiple times by page.
let LOCALES: string[]
let DEFAULT_LOCALE: string

/**
 * Get the configured locales.
 *
 * @returns A locale config object.
 */
export const getConfiguredLocales = (): LocalesConfig => {
  LOCALES = LOCALES ?? (process.env.nextMultilingualLocales?.split(',') as string[])
  DEFAULT_LOCALE = DEFAULT_LOCALE ?? (process.env.nextMultilingualDefaultLocale as string)

  return {
    locales: LOCALES,
    defaultLocale: DEFAULT_LOCALE,
  }
}
