import { existsSync, readFileSync } from 'node:fs'
import { highlight, highlightFilePath, log } from '../..'
import { isInDebugMode } from '../../config'
import type { BuildManifest, RequiredServerFiles, RoutesManifest } from '../../types'

// Throw a clear error is this is included by mistake on the client side.
if (typeof window !== 'undefined') {
  throw new Error(
    '`getBasePath` must only be used on the server, please use the `useRouter` hook instead'
  )
}

/** Local cache to avoid non-required file system operations. */
let basePathCache: string | undefined

/**
 * Sets the `basePathCache` value.
 *
 * @param basePath - The value of `basePath` to cache.
 *
 * @returns The `basePathCache` value.
 */
const setBasePathCache = (basePath: string): string => {
  basePathCache = basePath
  if (isInDebugMode()) {
    console.log('==== SERVER SIDE BASE PATH ====')
    console.dir(basePathCache, { depth: undefined })
  }
  return basePathCache
}

/**
 * Sets the `basePathCache` to an empty string and show warning messages.
 *
 * @param warningMessages - The warning messages to show when a `basePath` cannot be found.
 *
 * @returns An empty string since `basePath` cannot be found.
 */
const setEmptyCacheAndShowWarnings = (warningMessages: string[]): string => {
  warningMessages.forEach((warningMessage) => {
    log.warn(warningMessage)
  })
  log.warn(
    `Exhausted all options to get the ${highlight(
      'basePath'
    )} value. If you are using a ${highlight(
      'basePath'
    )}, your application's URLs will not work when using next-multilingual.`
  )
  return setBasePathCache('')
}

/**
 * Server-side alternative to get Next.js' `basePath` directly from the manifests.
 *
 * The returned object is cached locally for performance, so this API can be called frequented.
 *
 * @returns The base path value.
 */
export const getBasePath = (): string => {
  if (basePathCache !== undefined) {
    return basePathCache
  }

  const warningMessages: string[] = []

  // Try to get the base path from webpack.js - since Next.js 13.4.5-canary.1 this was the most reliable option.
  const webpackPath = '.next/static/chunks/webpack.js'

  if (existsSync(webpackPath)) {
    try {
      const match = readFileSync(webpackPath, 'utf8').match(
        /webpack\/runtime\/publicPath.*?__webpack_require__.*?"(.*?\/_next\/)";/s
      )
      if (!match) {
        throw new Error(`the base path was not found in ${webpackPath}`)
      }

      const [blockMatch, pathMatch] = match

      if (blockMatch.split('\n').length > 10) {
        // This code block should be 3 lines long, but we are giving ourselves some buffer.
        throw new Error(`the base path was not found in ${webpackPath}`)
      }

      const firstPathSegment = pathMatch.replaceAll(/^\/|\/$/g, '').split('/')[0]

      return firstPathSegment === '_next'
        ? setBasePathCache('')
        : setBasePathCache(`/${firstPathSegment}`)
    } catch {
      warningMessages.push(
        `Failed to get the ${highlight('basePath')} from ${highlightFilePath(
          webpackPath
        )} due to an unexpected file parsing error.`
      )
    }
  } else {
    warningMessages.push(
      `Failed to get the ${highlight('basePath')} from ${highlightFilePath(
        webpackPath
      )} because the file does not exist.`
    )
  }

  // Try to get the content of the routes-manifest (.next/routes-manifest.json) first - this is only available on builds.
  const routesManifestPath = '.next/routes-manifest.json'

  if (existsSync(routesManifestPath)) {
    try {
      const routesManifest = JSON.parse(readFileSync(routesManifestPath, 'utf8')) as RoutesManifest
      return setBasePathCache(routesManifest.basePath)
    } catch {
      warningMessages.push(
        `Failed to get the ${highlight('basePath')} from ${highlightFilePath(
          routesManifestPath
        )} due to an unexpected file parsing error.`
      )
    }
  } else {
    warningMessages.push(
      `Failed to get the ${highlight('basePath')} from ${highlightFilePath(
        routesManifestPath
      )} because the file does not exist.`
    )
  }

  // If the routes-manifest is not available, then get can get the base path from the required server files - this is only available on builds.
  const requiredServerFilesPath = '.next/required-server-files.json'

  if (existsSync(requiredServerFilesPath)) {
    try {
      const requiredServerFiles = JSON.parse(
        readFileSync(requiredServerFilesPath, 'utf8')
      ) as RequiredServerFiles
      return setBasePathCache(requiredServerFiles.config.basePath)
    } catch {
      warningMessages.push(
        `Failed to get the ${highlight('basePath')} from ${highlightFilePath(
          requiredServerFilesPath
        )} due to an unexpected file parsing error.`
      )
    }
  } else {
    warningMessages.push(
      `Failed to get the ${highlight('basePath')} from ${highlightFilePath(
        requiredServerFilesPath
      )} because the file does not exist.`
    )
  }

  // If everything else fails, we can look for the base path in the AMP file - this seems the best option in development mode.
  const buildManifestPath = '.next/build-manifest.json'
  const ampFilename = 'amp.js'

  if (!existsSync(buildManifestPath)) {
    warningMessages.push(
      `Unable to get the ${highlight('basePath')}: failed to get the location of ${highlight(
        ampFilename
      )} from ${highlightFilePath(buildManifestPath)} because the file does not exist.`
    )
    return setEmptyCacheAndShowWarnings(warningMessages)
  }

  let ampFilePath = ''
  try {
    const buildManifest = JSON.parse(readFileSync(buildManifestPath, 'utf8')) as BuildManifest
    const buildManifestAmpFilePath = buildManifest.ampDevFiles.find((filePath) =>
      filePath.endsWith(ampFilename)
    )
    if (!buildManifestAmpFilePath) {
      throw new Error(`unable to get the path for ${ampFilename}`)
    }
    ampFilePath = `.next/${buildManifestAmpFilePath}`
  } catch {
    warningMessages.push(
      `Unable to get the ${highlight('basePath')}: failed to get the location of ${highlight(
        ampFilename
      )} from ${highlightFilePath(buildManifestPath)} due to an unexpected file parsing error.`
    )
    return setEmptyCacheAndShowWarnings(warningMessages)
  }

  if (ampFilePath && !existsSync(ampFilePath)) {
    warningMessages.push(
      `Failed to get the ${highlight('basePath')} from ${highlightFilePath(
        ampFilePath
      )} because the file does not exist. 4`
    )
    return setEmptyCacheAndShowWarnings(warningMessages)
  }

  try {
    const ampFileContent = readFileSync(ampFilePath, 'utf8')
    const basePathMatch = ampFileContent.match(/var basePath =(?<basePath>.+?)\|\|/)

    if (basePathMatch?.groups) {
      const basePath = basePathMatch.groups.basePath.trim()

      if (basePath === 'false') {
        // This is the default value when no `basePath` is set.
        return setBasePathCache('')
      } else {
        if (basePath.startsWith('\\"') && basePath.endsWith('\\"')) {
          return setBasePathCache(basePath.slice(2, -2))
        } else {
          warningMessages.push(
            `Unable to get the ${highlight(
              'basePath'
            )}: unexpected value found in ${highlightFilePath(ampFilePath)}.`
          )
          return setEmptyCacheAndShowWarnings(warningMessages)
        }
      }
    } else {
      warningMessages.push(
        `Could not find ${highlight('basePath')} from ${highlightFilePath(ampFilePath)}.`
      )
      return setEmptyCacheAndShowWarnings(warningMessages)
    }
  } catch {
    warningMessages.push(
      `Failed to get the ${highlight('basePath')} from ${highlightFilePath(
        ampFilePath
      )} due to an unexpected file parsing error.`
    )
    return setEmptyCacheAndShowWarnings(warningMessages)
  }
}
