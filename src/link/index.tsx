import React, { ReactElement } from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { useRewriteSource } from '../hooks/useRewriteSource';

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
  const source = useRewriteSource({
    path: href,
    locale: locale || router.locale,
  });

  return <Link href={source} locale={locale} {...props} />;
}
