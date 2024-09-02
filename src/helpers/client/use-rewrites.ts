import { getClientBuildManifest } from 'next/dist/client/route-loader'
import { Rewrite } from 'next/dist/lib/load-custom-routes'
import { useEffect, useState } from 'react'
import { normalizeRewrite } from '../normalize-rewrite'

/**
 * The Next.js type for client build manifest is incomplete.
 *
 * @see https://github.com/vercel/next.js/blob/2cf5d3a8aa325f8bece1094c9e566311e604e114/packages/next/src/build/webpack/plugins/build-manifest-plugin.ts#L23
 */
export type ClientBuildManifest = {
  __rewrites: {
    afterFiles: Rewrite[]
  }
}

/**
 * Type guard to avoid casting the missing `ClientBuildManifest` type.
 *
 * @param clientBuildManifest - A Next.js client build manifest.
 *
 * @returns True if the type is right, otherwise false.
 */
const isClientBuildManifest = (
  clientBuildManifest: Record<string, object>
): clientBuildManifest is ClientBuildManifest => {
  const rewritesBase = clientBuildManifest?.__rewrites
  if ('afterFiles' in rewritesBase && Array.isArray(rewritesBase.afterFiles)) {
    return true
  }
  return false
}

/**
 * Hook to get the localized URL from a standard non-localized Next.js URL.
 *
 * @param locale - The locale of the localized URL.
 * @param urlPath - The non-localized URL path (e.g. `/contact-us`).
 *
 * @returns The localized URL or null when they are still loading.
 */
export const useRewrites = (): null | Rewrite[] => {
  const [rewrites, setRewrites] = useState<null | Rewrite[]>(null)

  useEffect(() => {
    getClientBuildManifest()
      .then((clientBuildManifest) => {
        if (isClientBuildManifest(clientBuildManifest)) {
          setRewrites(
            clientBuildManifest.__rewrites.afterFiles.map((rewrite) => normalizeRewrite(rewrite))
          )
        } else {
          throw new Error('unexpected client build manifest format')
        }
      })
      .catch(console.error)
  }, [])

  return rewrites
}
