import React, { Children, cloneElement, ReactElement } from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { useLocalizedUrl } from '../hooks/use-localized-url';

/**
 * MulLink is a wrapper around Next.js' `Link` that provides localized URLs.
 *
 * @param href - a localized path
 * @param locale - the locale to grab the correct localized path
 * @param props - Any property available on the `LinkProps` (properties of the Next.js' `Link` component)
 *
 * @returns The Next.js `Link` component with the correct localized URLs.
 */
export function MulLink({
  children,
  href,
  locale,
  ...props
}: React.PropsWithChildren<LinkProps> & { href: string; locale?: string }): ReactElement {
  const router = useRouter();
  locale = locale ? locale : router.locale;
  const localizedUrl = useLocalizedUrl(locale, href);
  try {
    if (Children.only(children) && typeof children === 'object' && 'type' in children) {
      // On the client, on first render useLocalizedUrl doesn't have access
      // to the rewrites data, and therefore uses the non-localized URL.
      // We suppress React's warning about the difference with the data
      // provided by the server, as a proper resolution to this would require
      // either including the rewrite data twice, or deeply refactoring how
      // Next.js works.
      children = cloneElement(children, { suppressHydrationWarning: true });
    }
  } catch (e) {
    // ignore any error; handled by <Link>
  }
  return (
    <Link href={localizedUrl} locale={locale} {...props}>
      {children}
    </Link>
  );
}
