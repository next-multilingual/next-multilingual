/**
 * Shared types.
 */
import { Rewrite } from 'next/dist/lib/load-custom-routes'
import { Router } from 'next/router'
import { UrlObject } from 'node:url'

/** Type used to get localized URLs. */
export type Url = string | UrlObject

/**
 * Rewrites (type is not available in Next.js)
 *
 * @see https://github.com/vercel/next.js/blob/d130f63c416b21adc67dc3c755ad6e1a707e2cc8/packages/next/build/webpack/plugins/build-manifest-plugin.ts#L41
 */
export type Rewrites = {
  /**
   * These rewrites are checked after headers/redirects and before all files including _next/public files which
   * allows overriding page files.
   */
  beforeFiles: Rewrite[]
  /** These rewrites are checked after pages/public files are checked but before dynamic routes. */
  afterFiles: Rewrite[]
  /** These rewrites are checked after both pages/public files and dynamic routes are checked. */
  fallback: Rewrite[]
}

/** Type representing a simplified version of Next.js' route manifest. */
export type RoutesManifest = {
  /** The base path normally available in `useRouter`. */
  basePath: string
  /** The router's rewrite configuration. */
  rewrites: Rewrite[]
}

/** Type representing a simplified version of Next.js' build manifest. */
export type BuildManifest = {
  ampDevFiles: string[]
  lowPriorityFiles: string[]
}

/** Type representing a simplified version of Next.js' required server files (manifest). */
export type RequiredServerFiles = {
  /** Next.js configurations. */
  config: {
    /** The base path normally available in `useRouter`. */
    basePath: string
  }
}

/**
 * Add the Next.js client to the `Window` object.
 *
 * @see https://github.com/vercel/next.js/blob/a6665915552caa5bd4baf3ce0a34a64e0539fc3f/packages/next/client/next.js
 */
declare global {
  interface Window {
    next: {
      version: string
      router: Router
    }
  }
}
