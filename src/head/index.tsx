import NextHead from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { getActualDefaultLocale, getActualLocales } from '..';
import { getApplicableUrl } from '../helpers/get-applicable-url';
import { useRewrites } from '../hooks/use-rewrites';

/**
 * Head is a wrapper around Next.js' `Head` that provides alternate links with localized URLs and a canonical link.
 *
 * @returns The Next.js `Head` component, including alternative links for SEO.
 */
export default function Head({ children }: { children: React.ReactNode }): JSX.Element {
  /**
   * Next.js' `<Head>` does not allow components, so we are using hooks. Details here:
   *
   * @see https://github.com/vercel/next.js/issues/17721 (closed issue)
   * @see https://nextjs.org/docs/api-reference/next/head (Next.js documentation)
   *
   * | title, meta or any other elements (e.g. script) need to be contained as direct children of the Head
   * | element, or wrapped into maximum one level of <React.Fragment> or arrays—otherwise the tags won't
   * | be correctly picked up on client-side navigation.
   *
   */
  const { pathname, basePath, defaultLocale, locales } = useRouter();
  const actualLocales = getActualLocales(locales, defaultLocale);
  const actualDefaultLocale = getActualDefaultLocale(locales, defaultLocale);
  const rewrites = useRewrites(); // Setting a variable here since React hooks can't be used in a callback.

  return (
    <NextHead>
      <link
        rel="canonical"
        href={getApplicableUrl(rewrites, pathname, actualDefaultLocale, basePath, true)}
        key="canonical-link"
      />
      {actualLocales.map((actualLocale) => {
        return (
          <link
            rel="alternate"
            href={getApplicableUrl(rewrites, pathname, actualLocale, basePath, true)}
            hrefLang={actualLocale}
            key={`alternate-link-${actualLocale}`}
          />
        );
      })}
      {children}
    </NextHead>
  );
}
