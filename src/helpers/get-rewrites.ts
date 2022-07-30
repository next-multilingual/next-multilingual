import { existsSync, readFileSync } from 'fs'

import { highlight, highlightFilePath, log } from '../'
import { isInDebugMode } from '../config'

import type { Rewrite } from 'next/dist/lib/load-custom-routes'
import type { BuildManifest, Rewrites, RoutesManifest } from '../types'

// Throw a clear error is this is included by mistake on the client side.
if (typeof window !== 'undefined') {
  throw new Error(
    '`getRewrites` must only be used on the server, please use the `useRewrites` hook instead'
  )
}

/** Local rewrite cache to avoid non-required file system operations. */
let rewritesCache: Rewrite[]

/**
 * Sets the `rewritesCache` value.
 *
 * @param rewrites - The value of `rewrites` to cache.
 *
 * @returns The `rewritesCache` value.
 */
function setRewritesCache(rewrites: Rewrite[]): Rewrite[] {
  rewritesCache = rewrites
  if (isInDebugMode()) {
    console.log('==== SERVER SIDE REWRITES ====')
    console.dir(rewritesCache, { depth: null })
  }
  return rewritesCache
}

/**
 * Sets the `rewritesCache` to an empty string and show warning messages.
 *
 * @param warningMessages - The warning messages to show when a `rewrites` cannot be found.
 *
 * @returns An empty string since `rewrites` cannot be found.
 */
function setEmptyCacheAndShowWarnings(warningMessages: string[]): Rewrite[] {
  warningMessages.forEach((warningMessage) => {
    log.warn(warningMessage)
  })
  log.warn(
    `Exhausted all options to get the ${highlight(
      'rewrites'
    )} value. Localized URLs will not work when using next-multilingual.`
  )
  return setRewritesCache([])
}

/**
 * `useRewrites` server-side alternative to get Next.js' `Rewrite` objects directly from the manifest.
 *
 * The returned object is cached locally for performance, so this API can be called frequented.
 *
 * @returns An array of `Rewrite` objects.
 */
export function getRewrites(): Rewrite[] {
  if (rewritesCache) return rewritesCache

  const warningMessages: string[] = []

  // Try to get the content of the routes-manifest (.next/routes-manifest.json) first - this is only available on builds.
  const routesManifestPath = '.next/routes-manifest.json'

  if (!existsSync(routesManifestPath)) {
    warningMessages.push(
      `Failed to get the ${highlight('rewrites')} from ${highlightFilePath(
        routesManifestPath
      )} because the file does not exist.`
    )
  } else {
    try {
      const routesManifest = JSON.parse(readFileSync(routesManifestPath, 'utf8')) as RoutesManifest
      return setRewritesCache(
        routesManifest.rewrites.map((rewrite) => {
          return {
            source: rewrite.source,
            destination: rewrite.destination,
            locale: rewrite.locale,
          }
        })
      )
    } catch (error) {
      warningMessages.push(
        `Failed to get the ${highlight('rewrites')} from ${highlightFilePath(
          routesManifestPath
        )} due to an unexpected file parsing error.`
      )
    }
  }

  // If the routes-manifest is not available, then get can get the rewrites from the build manifest.
  const buildManifestPath = '.next/build-manifest.json'
  const staticBuildManifestFilename = '_buildManifest.js'

  if (!existsSync(buildManifestPath)) {
    warningMessages.push(
      `Unable to get the ${highlight('rewrites')}: failed to get the location of ${highlight(
        staticBuildManifestFilename
      )} from ${highlightFilePath(buildManifestPath)} because the file does not exist.`
    )
    return setEmptyCacheAndShowWarnings(warningMessages)
  }

  let staticBuildManifestPath = ''
  try {
    const buildManifest = JSON.parse(readFileSync(buildManifestPath, 'utf8')) as BuildManifest
    staticBuildManifestPath = `.next/${
      buildManifest.lowPriorityFiles.find((filePath) =>
        filePath.endsWith(staticBuildManifestFilename)
      ) as string
    }`
  } catch (error) {
    warningMessages.push(
      `Unable to get the ${highlight('rewrites')}: failed to get the location of ${highlight(
        staticBuildManifestFilename
      )} from ${highlightFilePath(buildManifestPath)} due to an unexpected file parsing error.`
    )
    return setEmptyCacheAndShowWarnings(warningMessages)
  }

  if (!existsSync(staticBuildManifestPath)) {
    warningMessages.push(
      `Failed to get the ${highlight('rewrites')} from ${highlightFilePath(
        staticBuildManifestPath
      )} because the file does not exist.`
    )
    return setEmptyCacheAndShowWarnings(warningMessages)
  }

  try {
    const clientBuildManifestContent = readFileSync(staticBuildManifestPath, 'utf8')

    // Transform the client build-manifest file content back into a usable object.
    const clientBuildManifest = {} as { __BUILD_MANIFEST: { __rewrites: Rewrites } }
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function('self', clientBuildManifestContent)(clientBuildManifest)
    return setRewritesCache(clientBuildManifest.__BUILD_MANIFEST.__rewrites.afterFiles)
  } catch (error) {
    warningMessages.push(
      `Failed to get the ${highlight('rewrites')} from ${highlightFilePath(
        staticBuildManifestPath
      )} due to an unexpected file parsing error.`
    )
    return setEmptyCacheAndShowWarnings(warningMessages)
  }
}
