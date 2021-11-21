import { ReactElement } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { getLocalizedUrlPath } from '../helpers/get-localized-url-path';
import { getRewrites } from '../helpers/get-rewrites';

// Throw a clear error is this is included by mistake on the client side.
if (typeof window !== 'undefined') {
  throw new Error(
    '`next-multilingual/link-ssr` must only be used on the server, please use the `next-multilingual/link` instead'
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
  href,
  locale,
  ...props
}: NextLinkProps & { href: string; locale?: string }): ReactElement {
  const router = useRouter();
  locale = locale ? locale : router.locale;
  const localizedUrl = getLocalizedUrlPath(getRewrites(), locale, href);
  return <NextLink href={localizedUrl} locale={locale} {...props} />;
}
