import { getClientBuildManifest } from 'next/dist/client/route-loader'
import { Rewrite } from 'next/dist/lib/load-custom-routes'
import { useEffect, useState } from 'react'

/**
 * Manifest Rewrites (type is not available in Next.js)
 *
 * @see https://github.com/vercel/next.js/blob/d130f63c416b21adc67dc3c755ad6e1a707e2cc8/packages/next/build/webpack/plugins/build-manifest-plugin.ts#L41
 */
export type ManifestRewrites = {
  afterFiles: Rewrite[]
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
  // eslint-disable-next-line unicorn/no-null
  const [rewrites, setRewrites] = useState<null | Rewrite[]>(null)

  useEffect(() => {
    getClientBuildManifest()
      .then((clientBuildManifest) => {
        // Next.js needs to add types https://github.com/vercel/next.js/blob/d130f63c416b21adc67dc3c755ad6e1a707e2cc8/packages/next/build/webpack/plugins/build-manifest-plugin.ts#L41
        setRewrites((clientBuildManifest.__rewrites as unknown as ManifestRewrites).afterFiles)
      })
      .catch(console.error)
  }, [])

  return rewrites
}
