import NextJsLink from 'next/link'
import { useRouter } from '../router'
import { useLocalizedUrl } from '../url'

/** `next-multilingual`'s `Link` component props. */
export type MultilingualLinkProps = Parameters<typeof NextJsLink>[0]

/** Component type for `next-multilingual`'s `Link` (extends Next.js' `Link` type). */
export type MultilingualLink = typeof NextJsLink extends (...props: infer P) => infer Return
  ? (props: MultilingualLinkProps) => Return
  : never

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
