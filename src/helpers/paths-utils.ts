import { normalize } from 'node:path'

/**
 * Possible `pages` directories used by Next.js.
 *
 * @see https://nextjs.org/docs/advanced-features/src-directory
 */
export const PAGES_DIRECTORIES = ['pages', 'src/pages']

/**
 * These are the pages file extensions Next.js will use (in this order) if duplicate pages are found.
 */
export const PAGE_FILE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js']

/**
 * These are special page files used by Next.js that will not have their own routes. Extensions is excluded since they
 * can vary. The paths are relative to the `pages` directory.
 */
export const NON_ROUTABLE_PAGE_FILES = [
  'index',
  '_app',
  '_document',
  '_error',
  '404',
  '500',
  /**
   * `/404/index` and `500/index` is not officially supported or tested by Next.js but we believe it makes a cleaner setup, especially
   * when using messages files close to the pages.
   *
   * @see https://github.com/vercel/next.js/pull/39558
   *
   * Our Cypress `custom-error-pages` tests will help detect any changes to the supportability of this setup.
   */
  '404/index',
  '500/index',
]

/**
 * Normalize a Next.js pages file path.
 *
 * @param filesystemPath - A filesystem path (file or directory).
 *
 * @returns A normalized a Next.js pages file path.
 */
export const normalizePagesFilePath = (filesystemPath: string): string => {
  const normalizedPath = filesystemPath ? normalizePathSlashes(normalize(filesystemPath)) : ''

  for (const pagesDirectory of PAGES_DIRECTORIES) {
    if (normalizedPath.startsWith(`/${pagesDirectory}`)) {
      return normalizedPath.slice(pagesDirectory.length + 1)
    }
  }
  return normalizedPath
}

/**
 * TRansforms a Next.js pages file path into a URL path.
 *
 * @param filesystemPath - A filesystem path (file or directory).
 *
 * @returns The URL path representing the pages file path.
 */
export const pagesFilePathToUrlPath = (filesystemPath: string): string => {
  return removePagesFileExtension(normalizePagesFilePath(filesystemPath))
}

/**
 * Get the last segment of a path.
 *
 * @param path - A path (can be either a URL or filesystem path).
 *
 * @returns The last segment of a path.
 */
export const getLastPathSegment = (path: string): string => {
  const urlPath = removePagesFileExtension(path)
  return (urlPath.split('/').pop() as string) || ''
}

/**
 * Get a path excluding it's last segment.
 *
 * @param path - A path (can be either a URL or filesystem path).
 *
 * @returns The path excluding it's last segment.
 */
export const getPathWithoutLastSegment = (path: string): string => {
  return path.split('/').slice(0, -1).join('/') || '/'
}

/**
 * Remove a file extension from a filesystem path if present.
 *
 * @param filesystemPath - A filesystem path (file or directory).
 *
 * @return The filesystem path without the extension.
 */
export const removePagesFileExtension = (filesystemPath: string): string => {
  for (const pageFileExtension of PAGE_FILE_EXTENSIONS) {
    if (filesystemPath.endsWith(pageFileExtension)) {
      return filesystemPath.slice(0, -pageFileExtension.length)
    }
  }
  return filesystemPath
}

/**
 * Sort URLs in the order expected by Next.js.
 *
 * The rules are simple: sort by number of segments first, dynamic segments last and otherwise alphabetical.
 *
 * @param referenceUrl - The reference URL.
 * @param comparedUrl - The URL being compared.
 *
 * @returns The values expected by a sorting callback function.
 */
export const sortUrls = (referenceUrl: string, comparedUrl: string): number => {
  const referenceUrlSegments = referenceUrl.split('/')
  const comparedUrlSegments = comparedUrl.split('/')
  if (referenceUrlSegments.length < comparedUrlSegments.length) {
    // `referenceUrl` is sorted after `comparedUrl`.
    return 1
  }
  if (referenceUrlSegments.length > comparedUrlSegments.length) {
    // `comparedUrl` is sorted after `referenceUrl`.
    return -1
  }

  const lastReferenceUrlSegment = referenceUrlSegments.pop()
  const lastComparedUrlSegment = comparedUrlSegments.pop()

  // If there are no segments, the sort order stays the same.
  if (!lastReferenceUrlSegment || !lastComparedUrlSegment) {
    return 0
  }

  if (lastReferenceUrlSegment.startsWith(':')) {
    return lastComparedUrlSegment.startsWith(':')
      ? // Sort in alphabetical order since both URLs are dynamic.
        lastReferenceUrlSegment.localeCompare(lastComparedUrlSegment)
      : // `referenceUrl` is sorted after `comparedUrl` since it's a dynamic route.
        1
  }

  if (lastComparedUrlSegment.startsWith(':')) {
    // `comparedUrl` is sorted after `referenceUrl` since it's a dynamic route.
    return -1
  }

  // None of the URLs are dynamic, so we can sort them in alphabetical order
  return lastReferenceUrlSegment.localeCompare(lastComparedUrlSegment)
}

/**
 * Remove a trailing slash if present in a path.
 *
 * @param path - A path (can be either a URL, URL segment or filesystem path).
 *
 * @returns The path without a trailing slash.
 */
export const removeTrailingSlash = (path: string): string => {
  return path.endsWith('/') ? path.slice(0, -1) : path
}

/**
 * Remove a leading slash if present in a path.
 *
 * @param path - A path (can be either a URL, URL segment or filesystem path).
 *
 * @returns The path without a leading slash.
 */
export const removeLeadingSlash = (path: string): string => {
  return path.startsWith('/') ? path.slice(1) : path
}

/**
 * Add a leading slash if not present in a path.
 *
 * @param path - A path (can be either a URL, URL segment or filesystem path).
 *
 * @returns The path with a leading slash.
 */
export const addLeadingSlash = (path: string): string => {
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * Removes a trailing slash and add a leading slash to a path.
 *
 * @param path - A path (can be either a URL, URL segment or filesystem path).
 *
 * @returns A normalized path.
 */
export const normalizePathSlashes = (path: string): string => {
  return addLeadingSlash(removeTrailingSlash(path))
}
