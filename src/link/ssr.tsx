import { ReactElement } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { getRewrites } from '../helpers/get-rewrites';
import { getApplicableUrl } from '../helpers/get-applicable-url';

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
}: React.PropsWithChildren<NextLinkProps> & { href: string; locale?: string }): ReactElement {
  const router = useRouter();
  const applicableLocale = locale ? locale : router.locale;
  const applicableUrlPath = getApplicableUrl(getRewrites(), href, applicableLocale);

  return (
    <NextLink href={applicableUrlPath} locale={applicableLocale} {...props}>
      {children}
    </NextLink>
  );
}
