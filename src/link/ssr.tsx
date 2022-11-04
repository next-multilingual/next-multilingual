import NextJsLink from 'next/link'
import React from 'react'
import type { MultilingualLink, MultilingualLinkProps } from '.'
import { useRouter } from '../router'
import { useLocalizedUrl } from '../url/ssr'

// Throw a clear error is this is included by mistake on the client side.
if (typeof window !== 'undefined') {
  throw new Error(
    '`next-multilingual/link/ssr` must only be used on the server, please use `next-multilingual/link` instead'
  )
}

/**
 * Link is a wrapper around Next.js' `Link` that provides localized URLs.
 *
 * @returns The Next.js `Link` component with the correct localized URLs.
 */
// eslint-disable-next-line prefer-arrow-functions/prefer-arrow-functions
const Link: MultilingualLink = React.forwardRef(function LinkWrapper(
  props: MultilingualLinkProps,
  reference
) {
  const { href, locale, localizedRouteParameters, children, ...parentProps } = props
  const router = useRouter()
  const applicableLocale = locale || router.locale
  const url = typeof href === 'string' && href[0] === '#' ? `${router.pathname}${href}` : href
  const localizedUrl = useLocalizedUrl(url, applicableLocale, localizedRouteParameters)
  return (
    <NextJsLink href={localizedUrl} locale={applicableLocale} ref={reference} {...parentProps}>
      {children}
    </NextJsLink>
  )
})

export default Link
