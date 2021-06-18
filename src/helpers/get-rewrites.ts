import { resolve } from 'path';
import { readFileSync } from 'fs';
import type { Rewrite } from 'next/dist/lib/load-custom-routes';
import type { ManifestRewrites } from '../types';

/** Local rewrite cache to avoid non-required file system operations. */
let rewritesCache: Rewrite[];

/**
 * Get the Next.js `Rewrite` objects directly from the build manifest.
 *
 * On the client side it's possible to use `getClientBuildManifest` but for server side rendering, this function is required.
 *
 * @returns An array of `Rewrite` objects.
 */
export function getRewrites(): Rewrite[] {
  if (rewritesCache) return rewritesCache;

  // Get the content from the Next.js build-manifest (.next/build-manifest.json).
  const buildManifestPath = resolve('.next', 'build-manifest.json');
  const buildManifestContent = readFileSync(buildManifestPath, 'utf8');

  // Get the content of the client build-manifest (e.g. .next/static/development/_buildManifest.json).
  const clientBuildManifestPath = (
    JSON.parse(buildManifestContent).lowPriorityFiles as string[]
  ).find((filePaths) => filePaths.includes('_buildManifest.js'));
  const clientBuildManifestContent = readFileSync(
    resolve('.next', clientBuildManifestPath),
    'utf8'
  );

  // Transform the client build-manifest back into a function.
  const clientBuildManifest = {} as { __BUILD_MANIFEST: { __rewrites: ManifestRewrites } };
  new Function('self', clientBuildManifestContent)(clientBuildManifest);

  // Save to the cache.
  rewritesCache = clientBuildManifest.__BUILD_MANIFEST.__rewrites.afterFiles;

  return rewritesCache;
}
