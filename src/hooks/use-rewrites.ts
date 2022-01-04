import { ClientBuildManifest } from 'next/dist/build/webpack/plugins/build-manifest-plugin';
import { getClientBuildManifest } from 'next/dist/client/route-loader';
import { Rewrite } from 'next/dist/lib/load-custom-routes';
import { useEffect, useState } from 'react';

import type { Rewrites } from '../types';

/**
 * Hook to get the localized URL from a standard non-localized Next.js URL.
 *
 * @param locale - The locale of the localized URL.
 * @param urlPath - The non-localized URL path (e.g., `/contact-us`).
 *
 * @returns The localized URL.
 */
export function useRewrites(): Rewrite[] {
  let buildManifestRewrites: Rewrite[] = [];

  if (typeof window !== 'undefined' && typeof window.__BUILD_MANIFEST !== 'undefined') {
    /**
     * In our previous releases, we used to get `rewrites` from `getClientBuildManifest()` which is an async
     * function. This caused problems during first render and we needed to clone child elements on our `<Link>`
     * component which used `suppressHydrationWarning`. Of course this no longer worked when we release the
     * `useLocalizedUrl` hook and using `window.__BUILD_MANIFEST` seemed to resolve all these issues since it
     * is available on first render.
     */
    const buildManifest = window.__BUILD_MANIFEST as ClientBuildManifest;
    buildManifestRewrites = (buildManifest.__rewrites as unknown as Rewrites).afterFiles;
  }

  const [rewrites, setRewrites] = useState<Rewrite[]>(buildManifestRewrites);

  /**
   * `getClientBuildManifest` is required when building Next.js as `window` is not available.
   */
  useEffect(() => {
    getClientBuildManifest()
      .then((clientBuildManifest) => {
        // Next.js needs to add types https://github.com/vercel/next.js/blob/d130f63c416b21adc67dc3c755ad6e1a707e2cc8/packages/next/build/webpack/plugins/build-manifest-plugin.ts#L41
        setRewrites((clientBuildManifest.__rewrites as unknown as Rewrites).afterFiles);
      })
      .catch(console.error);
  }, []);

  return rewrites;
}
