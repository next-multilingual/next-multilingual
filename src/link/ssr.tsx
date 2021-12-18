import { ReactElement } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { getRewrites } from '../helpers/get-rewrites';
import { getLocalizedUrl } from '../helpers/get-localized-url';
import { Url } from '../types';

// Throw a clear error is this is included by mistake on the client side.
if (typeof window !== 'undefined') {
  throw new Error(
    '`next-multilingual/link/ssr` must only be used on the server, please use `next-multilingual/link` instead'
  );
}

/**
 * Link is a wrapper around Next.js' `Link` that provides localized URLs.
 *
 * This is meant to be used on the server only. Using it on the client side will result in compilation errors.
 *
 * @param href - A non-localized Next.js `href` without a locale prefix (e.g. `/contact-us`)
 * @param locale - The locale to grab the correct localized path.
 * @param props - Any property available on the `LinkProps` (properties of the Next.js' `Link` component).
 *
 * @returns The Next.js `Link` component with the correct localized URLs.
 */
export default function Link({
  children,
  href,
  locale,
  ...props
}: React.PropsWithChildren<NextLinkProps>): ReactElement {
  const router = useRouter();
  const applicableLocale = locale ? locale : router.locale;
  const localizedUrl = useLocalizedUrl(href, applicableLocale);

  return (
    <NextLink href={localizedUrl} locale={applicableLocale} {...props}>
      {children}
    </NextLink>
  );
}

/**
 * React hook to get the localized URL specific to a Next.js context.
 *
 * @param urlPath - A non-localized Next.js `href` without a locale prefix (e.g. `/contact-us`) or its equivalent using
 * a `UrlObject`.
 * @param locale - The locale of the localized URL. When not specified, the current locale is used.
 * @param absolute - Returns the absolute URL, including the protocol and
 * domain (e.g. https://example.com/en-us/contact-us). By default relative URLs are used.
 *
 * @returns The localized URL path when available, otherwise fallback to a standard non-localized Next.js URL.
 */
export function useLocalizedUrl(
  urlPath: Url,
  locale: string = undefined,
  absolute = false
): string {
  const router = useRouter();
  const applicableLocale = locale ? locale : router.locale;
  return getLocalizedUrl(getRewrites(), urlPath, applicableLocale, router.basePath, absolute);
}
