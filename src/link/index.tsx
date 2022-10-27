import NextJsLink from 'next/link'
import { LocalizedRouteParameters, useRouter } from '../router'
import { useLocalizedUrl } from '../url'

/** `next-multilingual`'s `Link` component props. */
export type MultilingualLinkProps = Omit<Parameters<typeof NextJsLink>[0], 'href'> & {
  /** A non-localized Next.js URL path without a locale prefix (e.g., `/contact-us`). */
  href: string
  /** Localized route parameters, if the page is using a dynamic route. */
  localizedRouteParameters?: LocalizedRouteParameters
}

/** Component type for `next-multilingual`'s `Link` (extends Next.js' `Link` type). */
export type MultilingualLink = typeof NextJsLink extends (...props: infer P) => infer Return
  ? (props: MultilingualLinkProps) => Return
  : never

/**
 * Link is a wrapper around Next.js' `Link` that provides localized URLs.
 *
 * @returns The Next.js `Link` component with the correct localized URLs.
 */
const Link: MultilingualLink = ({
  href,
  locale,
  localizedRouteParameters,
  children,
  ...props
}: MultilingualLinkProps) => {
  const router = useRouter()
  const applicableLocale = locale || router.locale
  const url = typeof href === 'string' && href[0] === '#' ? `${router.pathname}${href}` : href
  const localizedUrl = useLocalizedUrl(url, applicableLocale, localizedRouteParameters)
  return (
    <NextJsLink href={localizedUrl} locale={applicableLocale} {...props}>
      {children}
    </NextJsLink>
  )
}

export default Link
