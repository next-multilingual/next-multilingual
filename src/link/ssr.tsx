import NextJsLink from 'next/link'
import { MultilingualLink, MultilingualLinkProps } from '.'
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
 * @param props.href - A non-localized Next.js URL path without a locale prefix (e.g., `/contact-us`) or its equivalent using
 * a `UrlObject`.
 * @param props.locale - The locale to grab the correct localized path.
 * @param props.props - Any property available on the `LinkProps` (properties of the Next.js' `Link` component).
 *
 * @returns The Next.js `Link` component with the correct localized URLs.
 */
const Link: MultilingualLink = ({ href, locale, children, ...props }: MultilingualLinkProps) => {
  const router = useRouter()
  const applicableLocale = locale || router.locale
  const url = typeof href === 'string' && href[0] === '#' ? `${router.pathname}${href}` : href
  const localizedUrl = useLocalizedUrl(url, applicableLocale)

  return (
    <NextJsLink href={localizedUrl} locale={applicableLocale} {...props}>
      {children}
    </NextJsLink>
  )
}

export default Link
