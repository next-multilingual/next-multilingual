import { existsSync, readFileSync } from 'fs';

import { highlightFilePath, log } from '../';
import { isInDebugMode } from '../config';

import type { Rewrite } from 'next/dist/lib/load-custom-routes';
import type { Rewrites } from '../types';

// Throw a clear error is this is included by mistake on the client side.
if (typeof window !== 'undefined') {
  throw new Error(
    '`getRewrites` must only be used on the server, please use the `useRewrites` hook instead'
  );
}

/** Local rewrite cache to avoid non-required file system operations. */
let rewritesCache: Rewrite[];

/** Object representing a simplified version of the route manifest files. */
export type RoutesManifest = {
  rewrites: Rewrite[];
};

/**
 * `useRewrites` server-side alternative to get the Next.js `Rewrite` objects directly from the build manifest.
 *
 * The returned object is cached locally for performance, so this API can be called frequented.
 *
 * @returns An array of `Rewrite` objects.
 */
export function getRewrites(): Rewrite[] {
  if (rewritesCache) return rewritesCache;

  let foundManifest = false;

  // Try to get the content of the routes-manifest (.next/routes-manifest.json) first - this is only available on builds.
  const routesManifestPath = '.next/routes-manifest.json';

  if (existsSync(routesManifestPath)) {
    foundManifest = true;
    try {
      const routesManifest = JSON.parse(readFileSync(routesManifestPath, 'utf8')) as RoutesManifest;
      const rewrites = routesManifest.rewrites.map((rewrite) => {
        return {
          source: rewrite.source,
          destination: rewrite.destination,
          locale: rewrite.locale,
        };
      });

      // Save to the cache.
      rewritesCache = rewrites;
    } catch (error) {
      log.warn(
        `URLs will not be localized on SSR markup due to an unexpected error while reading ${routesManifestPath}: ${
          (error as Error).message
        }`
      );
      rewritesCache = [];
    }
  }

  // If the routes-manifest is not available, then get can get the rewrites from the build manifest.
  const buildManifestPath = '.next/build-manifest.json';

  if (existsSync(buildManifestPath)) {
    foundManifest = true;

    try {
      const buildManifestContent = readFileSync(buildManifestPath, 'utf8');

      // Get the content of the build-manifest (e.g., .next/static/development/_buildManifest.json).
      const staticBuildManifestPath = `.next/${(
        JSON.parse(buildManifestContent).lowPriorityFiles as string[]
      ).find((filePaths) => filePaths.includes('_buildManifest.js'))}`;

      if (existsSync(staticBuildManifestPath)) {
        try {
          const clientBuildManifestContent = readFileSync(staticBuildManifestPath, 'utf8');

          // Transform the client build-manifest file content back into a usable object.
          const clientBuildManifest = {} as { __BUILD_MANIFEST: { __rewrites: Rewrites } };
          new Function('self', clientBuildManifestContent)(clientBuildManifest);

          // Save to the cache.
          rewritesCache = clientBuildManifest.__BUILD_MANIFEST.__rewrites.afterFiles;
        } catch (error) {
          log.warn(
            `URLs will not be localized on SSR markup due to an unexpected error while reading ${highlightFilePath(
              staticBuildManifestPath
            )}: ${(error as Error).message}`
          );
          rewritesCache = [];
        }
      }
    } catch (error) {
      log.warn(
        `URLs will not be localized on SSR markup due to an unexpected error while reading ${highlightFilePath(
          buildManifestPath
        )}: ${(error as Error).message}`
      );
      rewritesCache = [];
    }
  }

  if (!foundManifest) {
    log.warn(
      `URLs will not be localized on SSR markup because no manifest file could be found at either ${highlightFilePath(
        routesManifestPath
      )} or ${highlightFilePath(buildManifestPath)}`
    );
    rewritesCache = [];
  }

  if (isInDebugMode()) {
    console.log('==== SERVER SIDE REWRITES ====');
    console.dir(rewritesCache, { depth: null });
  }

  return rewritesCache;
}
