import { ClientBuildManifest } from 'next/dist/build/webpack/plugins/build-manifest-plugin';
import { Rewrite } from 'next/dist/lib/load-custom-routes';
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
  /**
   * In our previous releases, we used to get `rewrites` from `getClientBuildManifest()` which is an async
   * function. This caused problems during first render and we needed to clone child elements on our `<Link>`
   * component which used `suppressHydrationWarning`. Of course this no longer worked when we release the
   * `useLocalizedUrl` hook and using `window.__BUILD_MANIFEST` seemed to resolve all these issues since it
   * is available on first render.
   */
  const buildManifest = window.__BUILD_MANIFEST as ClientBuildManifest;
  const rewrites = buildManifest.__rewrites as unknown as Rewrites;
  return rewrites.afterFiles;
}
