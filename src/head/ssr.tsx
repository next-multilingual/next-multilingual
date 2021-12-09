import NextHead from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { getActualDefaultLocale, getActualLocales, normalizeLocale } from '..';
import { getApplicableUrl } from '../helpers/get-applicable-url';
import { getRewrites } from '../helpers/get-rewrites';

// Throw a clear error is this is included by mistake on the client side.
if (typeof window !== 'undefined') {
  throw new Error(
    '`next-multilingual/head/ssr` must only be used on the server, please use `next-multilingual/head` instead'
  );
}

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

  return (
    <NextHead>
      <link
        rel="canonical"
        href={getApplicableUrl(getRewrites(), pathname, actualDefaultLocale, basePath, true)}
        key="canonical-link"
      />
      {actualLocales.map((actualLocale) => {
        return (
          <link
            rel="alternate"
            href={getApplicableUrl(getRewrites(), pathname, actualLocale, basePath, true)}
            hrefLang={normalizeLocale(actualLocale)}
            key={`alternate-link-${actualLocale}`}
          />
        );
      })}
      {children}
    </NextHead>
  );
}
