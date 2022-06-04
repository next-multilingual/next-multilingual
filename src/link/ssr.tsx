import type { ReactElement } from 'react';
import NextJsLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/router';

import { useLocalizedUrl } from '../url/ssr';

// Throw a clear error is this is included by mistake on the client side.
if (typeof window !== 'undefined') {
  throw new Error(
    '`next-multilingual/link/ssr` must only be used on the server, please use `next-multilingual/link` instead'
  );
}

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
}: React.PropsWithChildren<NextLinkProps>): ReactElement<typeof NextJsLink> {
  const router = useRouter();
  const applicableLocale = locale ? locale : router.locale;
  const url = typeof href === 'string' && href[0] === '#' ? `${router.pathname}${href}` : href;
  const localizedUrl = useLocalizedUrl(url, applicableLocale);

  return (
    <NextJsLink href={localizedUrl} locale={applicableLocale} {...props}>
      {children}
    </NextJsLink>
  );
}
