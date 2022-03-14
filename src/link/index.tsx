import type { ReactElement } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/router';

import { getLocalizedUrl } from '../helpers/get-localized-url';
import { useRewrites } from '../hooks/use-rewrites';
import { Url } from '../types';

/**
 * Link is a wrapper around Next.js' `Link` that provides localized URLs.
 *
 * @param href - A non-localized Next.js URL path without a locale prefix (e.g., `/contact-us`) or its equivalent using
 * a `UrlObject`.
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
  const url = typeof href === 'string' && href[0] === '#' ? `${router.pathname}${href}` : href;
  const localizedUrl = useLocalizedUrl(url, applicableLocale);

  return (
    <NextLink href={localizedUrl} locale={applicableLocale} {...props}>
      {children}
    </NextLink>
  );
}

/**
 * React hook to get the localized URL specific to a Next.js context.
 *
 * @param url - A non-localized Next.js URL path without a locale prefix (e.g., `/contact-us`) or its equivalent using
 * a `UrlObject`.
 * @param locale - The locale of the localized URL. When not specified, the current locale is used.
 * @param absolute - Returns the absolute URL, including the protocol and
 * domain (e.g., https://example.com/en-us/contact-us). By default relative URLs are used.
 *
 * @returns The localized URL path when available, otherwise fallback to a standard non-localized Next.js URL.
 */
export function useLocalizedUrl(
  url: Url,
  locale: string | undefined = undefined,
  absolute = false
): string {
  const router = useRouter();
  const applicableLocale = locale ? locale : router.locale;
  return getLocalizedUrl(useRewrites(), url, applicableLocale, router.basePath, absolute);
}
