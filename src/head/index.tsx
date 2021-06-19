import Head from 'next/head';
import React from 'react';
import { useAlternateLinks } from '../hooks/use-alternate-links';

export function MulHead({ children }: { children: React.ReactNode }): JSX.Element {
  const alternateLinks = useAlternateLinks();

  return (
    <Head>
      {alternateLinks.map(({ href, hrefLang }) => (
        <link rel="alternate" href={`${href}`} hrefLang={hrefLang} key={hrefLang} />
      ))}
      {children}
    </Head>
  );
}
