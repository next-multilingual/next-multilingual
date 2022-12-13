import { ClientBuildManifest } from 'next/dist/build/webpack/plugins/build-manifest-plugin'
import { Rewrite } from 'next/dist/lib/load-custom-routes'
import type { Rewrites } from '../../types'

// Throw a clear error is this is included by mistake on the server side.
if (typeof window === 'undefined') {
  throw new Error(
    '`getRewrites` must only be used on the client side, please use `server/getRewrites` instead'
  )
}

/**
 * Get `Rewrite` objects directly from the client build manifest.
 *
 * @returns An array of `Rewrite` objects.
 */
export const getRewrites = (): Promise<Rewrite[]> => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const rewrites = (
        (window?.__BUILD_MANIFEST as ClientBuildManifest)?.__rewrites as unknown as Rewrites
      )?.afterFiles

      if (rewrites) {
        clearInterval(interval)
        resolve(rewrites)
      }
    }, 10)
  })
}
