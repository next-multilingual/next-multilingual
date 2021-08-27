/**
 * Shared types.
 */

import { Rewrite } from 'next/dist/lib/load-custom-routes';

/**
 * Manifest Rewrites (type is not available in Next.js)
 *
 * @see https://github.com/vercel/next.js/blob/d130f63c416b21adc67dc3c755ad6e1a707e2cc8/packages/next/build/webpack/plugins/build-manifest-plugin.ts#L41
 */
export type ManifestRewrites = {
  afterFiles: Rewrite[];
};
