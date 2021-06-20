import Head from 'next/head';
import React from 'react';
import { normalizeLocale } from '..';
import { useAlternateLinks } from '../hooks/use-alternate-links';

/**
 * MulHead is a wrapper around Next.js' `Head` that provides alternate links with localized URLs.
 *
 * This component should have a positive impact on SEO by both providing alternative link markup following the guidelines
 * provided by Google and also optimizing keyword relevancy by using localized URLs.
 *
 * @returns The Next.js `Head` component, including alternative links for SEO.
 */
export function MulHead({ children }: { children: React.ReactNode }): JSX.Element {
  const alternateLinks = useAlternateLinks();

  return (
    <Head>
      {alternateLinks.map(({ href, hrefLang }) => (
        <link
          rel="alternate"
          href={`${href}`}
          hrefLang={normalizeLocale(hrefLang)}
          key={hrefLang}
        />
      ))}
      {children}
    </Head>
  );
}
