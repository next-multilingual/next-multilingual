/** This is the "sanitized" origin to avoid re-validating each time `getOrigin` is called. */
let origin: string

/**
 * Get the current environment's URL origin (protocol + domain).
 *
 * @returns The normalized (lowercase, without a trailing slash) URL origin used to generate fully-qualified URLs.
 */
export function getOrigin(): string {
  if (origin !== undefined) return origin

  const nextPublicOrigin = process.env.NEXT_PUBLIC_ORIGIN

  if (!nextPublicOrigin) {
    throw new Error(
      'Please add NEXT_PUBLIC_ORIGIN in your current environment variable with a fully-qualified URL (protocol + domain)'
    )
  }

  const matches = nextPublicOrigin.match(/^https?:\/\/.+$/)

  if (!matches) {
    throw new Error(
      'Please make sure that your NEXT_PUBLIC_ORIGIN includes either the `http` or `https` protocol and is a fully-qualified URL (e.g., https://example.com) without any path'
    )
  }

  const normalizedOrigin = nextPublicOrigin.endsWith('/')
    ? nextPublicOrigin.slice(0, -1)
    : nextPublicOrigin

  const slashCount = (normalizedOrigin.match(/\//g) || []).length

  if (slashCount > 2) {
    throw new Error(
      'Please remove any path from your NEXT_PUBLIC_ORIGIN fully-qualified URL (e.g., https://example.com)'
    )
  }

  origin = normalizedOrigin
  return origin
}
