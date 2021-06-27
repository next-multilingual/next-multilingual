import React, { ReactElement } from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { getLocalizedUrlPath } from '../helpers/get-localized-url-path';
import { getRewrites } from '../helpers/get-rewrites';

// Throw a clear error is this is included by mistake on the client side.
if (typeof window !== 'undefined') {
  throw new Error(
    'please use the `next-multilingual/link` on the client side, not `next-multilingual/link-ssr`'
  );
}

/**
 * MulLink is a wrapper around Next.js' `Link` that provides localized URLs.
 *
 * This is meant to be used on the server only. Using it on the client side will result in compilation errors.
 *
 * @param href - A non-localized Next.js `href` without a locale prefix (e.g. `/contact-us`)
 * @param locale - The locale to grab the correct localized path.
 * @param props - Any property available on the `LinkProps` (properties of the Next.js' `Link` component).
 *
 * @returns The Next.js `Link` component with the correct localized URLs.
 */
export function MulLink({
  href,
  locale,
  ...props
}: LinkProps & { href: string; locale?: string }): ReactElement {
  const router = useRouter();
  locale = locale ? locale : router.locale;
  const localizedUrl = getLocalizedUrlPath(getRewrites(), locale, href);
  return <Link href={localizedUrl} locale={locale} {...props} />;
}
