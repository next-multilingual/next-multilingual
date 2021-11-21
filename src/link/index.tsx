import React, { Children, cloneElement } from 'react';
import type { ReactElement } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { useLocalizedUrl } from '../hooks/use-localized-url';

/**
 * Link is a wrapper around Next.js' `Link` that provides localized URLs.
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
}: React.PropsWithChildren<NextLinkProps> & { href: string; locale?: string }): ReactElement {
  const router = useRouter();
  locale = locale ? locale : router.locale;
  const localizedUrl = useLocalizedUrl(locale, href);
  try {
    if (Children.only(children) && typeof children === 'object' && 'type' in children) {
      /**
       * On the client, on first render `useLocalizedUrl` doesn't have access to the rewrites data,
       * and therefore uses the non-localized URL. We suppress React's warning about the difference
       * with the data provided by the server, as a proper resolution to this would require either
       * including the rewrite data twice, or deeply refactoring how Next.js works.
       */
      children = cloneElement(children, { suppressHydrationWarning: true });
    }
  } catch (error) {
    // Ignore any error; they will be handled by <Link>
  }
  return (
    <NextLink href={localizedUrl} locale={locale} {...props}>
      {children}
    </NextLink>
  );
}
