/** This is the "sanitized" origin to avoid re-validating each time `getOrigin` is called. */
let origin: string

/**
 * Get the current environment's URL origin (protocol + domain).
 *
 * @returns The normalized (lowercase, without a trailing slash) URL origin used to generate fully-qualified URLs.
 */
export const getOrigin = (): string => {
  if (origin !== undefined) return origin

  const nextPublicOrigin = process.env.NEXT_PUBLIC_ORIGIN

  if (!nextPublicOrigin) {
    throw new Error(
      'Please add NEXT_PUBLIC_ORIGIN in your current environment variable with a fully-qualified URL (e.g., https://example.com)'
    )
  }

  const urlObject = (() => {
    try {
      return new URL(nextPublicOrigin)
    } catch {
      throw new Error(
        'Invalid NEXT_PUBLIC_ORIGIN environment variable. Make sure it is a fully-qualified URL (e.g., https://example.com)'
      )
    }
  })()

  if (!['http:', 'https:'].includes(urlObject.protocol)) {
    throw new Error(
      'Invalid NEXT_PUBLIC_ORIGIN environment variable. The URL must either use the `http` or `https` protocol'
    )
  }

  if (urlObject.pathname && urlObject.pathname !== '/') {
    throw new Error(
      'Invalid NEXT_PUBLIC_ORIGIN environment variable. The URL must not contain a path'
    )
  }

  return urlObject.origin
}
