import React, { ReactElement } from 'react';
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
 * @returns The `Link` component with the correct localized URLs.
 */
export function MulLink({
  href,
  locale,
  ...props
}: React.PropsWithChildren<LinkProps> & { href: string; locale?: string }): ReactElement {
  const router = useRouter();
  locale = locale ? locale : router.locale;
  const localizedUrl = useLocalizedUrl(locale, href);
  return <Link href={localizedUrl} locale={locale} {...props} />;
}
