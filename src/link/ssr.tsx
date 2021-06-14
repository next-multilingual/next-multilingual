import React, { ReactElement } from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { getLocalizedUrl } from '../helpers/getLocalizedUrl';
import { getRewrites } from '../helpers/getRewrites';

/**
 * MulLink is a wrapper around Next.js' `Link` that provides localized URLs.
 *
 * This is meant to be used on the server only. Using it on the client side will result in compilation errors.
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
}: LinkProps & { href: string; locale?: string }): ReactElement {
  const router = useRouter();
  locale = locale ? locale : router.locale;
  const sourceUrl = getLocalizedUrl(getRewrites(), locale, href);
  return <Link href={sourceUrl} locale={locale} {...props} />;
}