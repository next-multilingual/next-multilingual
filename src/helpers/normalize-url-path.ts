/**
 * Normalize a URL.
 *
 * A normalized URL should: always start with a slash, never end with a slash and never contain double slashes.
 *
 * @param urlPath - The URl to normalize.
 *
 * @returns A normalized URL.
 */
export function normalizeUrlPath(urlPath?: string): string {
  // Remove double slashes just in case.
  let normalizedUrlPath = urlPath.replace(/\/\//g, '/');

  // Make sure the base path starts with a slash.
  normalizedUrlPath = normalizedUrlPath.startsWith('/')
    ? normalizedUrlPath
    : `/${normalizedUrlPath}`;

  // Make sure the base path does not end with a slash.
  normalizedUrlPath = normalizedUrlPath.endsWith('/')
    ? normalizedUrlPath.slice(0, -1)
    : normalizedUrlPath;

  return normalizedUrlPath;
}
