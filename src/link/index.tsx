import React, { Children, cloneElement } from 'react';
import type { ReactElement } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { useRewrites } from '../hooks/use-rewrites';
import { getApplicableUrl } from '../helpers/get-applicable-url';
import { hydrateUrlQuery } from '..';

/**
 * Link is a wrapper around Next.js' `Link` that provides localized URLs.
 *
 * @param href - A non-localized Next.js `href` without a locale prefix (e.g. `/contact-us`) or its equivalent using
 * a `UrlObject` (mostly useful when using dynamic routes).
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
  const searchableUrl = href['pathname'] !== undefined ? href['pathname'] : href;
  const applicableUrlPath = getApplicableUrl(useRewrites(), searchableUrl, applicableLocale);

  try {
    if (Children.only(children) && typeof children === 'object' && 'type' in children) {
      /**
       * On the client, on first render, Next.js doesn't have access to the rewrites data,
       * and therefore uses "semi-localized" URL paths (e.g. `/fr-ca/about-us`). We suppress React's warning
       * about the difference with the data provided by the server, as a proper resolution to this would require
       * either including the rewrite data twice, or deeply refactoring how Next.js works.
       */
      children = cloneElement(children, { suppressHydrationWarning: true });
    }
  } catch (error) {
    // Ignore any error; they will be handled by <Link>
  }
  return (
    <NextLink
      href={
        href['query'] !== undefined
          ? hydrateUrlQuery(applicableUrlPath, href['query'])
          : applicableUrlPath
      }
      locale={applicableLocale}
      {...props}
    >
      {children}
    </NextLink>
  );
}
