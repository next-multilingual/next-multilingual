import { useRouter } from 'next/router'

import { getBasePath } from '../helpers/get-base-path'
import { getLocalizedUrlFromRewrites } from '../helpers/get-localized-url-from-rewrites'
import { getSsrRewrites } from '../helpers/get-ssr-rewrites'
import { Url } from '../types'

// Throw a clear error is this is included by mistake on the client side.
if (typeof window !== 'undefined') {
  throw new Error(
    '`next-multilingual/link/ssr` must only be used on the server, please use `next-multilingual/link` instead'
  )
}

/**
 * React hook to get the localized URL specific to a Next.js context.
 *
 * @param url - A non-localized Next.js URL path without a locale prefix (e.g., `/contact-us`) or its equivalent using
 * a `UrlObject`.
 * @param locale - The locale of the localized URL. When not specified, the current locale is used.
 * @param absolute - Returns the absolute URL, including the protocol and
 * domain (e.g., https://example.com/en-us/contact-us). By default relative URLs are used.
 * @param includeBasePath - Include Next.js' `basePath` in the returned URL. By default Next.js does not require it, but
 * if `absolute` is used, this will be forced to `true`.
 *
 * @returns The localized URL path when available, otherwise fallback to a standard non-localized Next.js URL.
 */
export function useLocalizedUrl(
  url: Url,
  locale?: string | undefined,
  absolute = false,
  includeBasePath = false
): string {
  const router = useRouter()
  const applicableLocale = locale ?? router.locale
  return getLocalizedUrlFromRewrites(
    getSsrRewrites(),
    url,
    applicableLocale,
    absolute,
    router.basePath,
    includeBasePath
  )
}

/**
 * Get the localized URL path when available, otherwise fallback to a standard non-localized Next.js URL.
 *
 * @param url - A non-localized Next.js URL path without a locale prefix (e.g., `/contact-us`) or its equivalent using
 * a `UrlObject`.
 * @param locale - The locale of the localized URL.
 * @param absolute - Returns the absolute URL, including the protocol and domain (e.g., https://example.com/en-us/contact-us).
 *
 * @returns The localized URL path when available, otherwise fallback to a standard non-localized Next.js URL.
 */
export function getLocalizedUrl(url: Url, locale: string, absolute = false): string {
  return getLocalizedUrlFromRewrites(
    getSsrRewrites(),
    url,
    locale.toLowerCase(),
    absolute,
    getBasePath()
  )
}
