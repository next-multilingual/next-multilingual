import Head from 'next/head';
import React, { ReactElement, ReactNode } from 'react';
import { useAlternateLinks } from './hooks/useAlternateLinks';

interface IntlHeadProps {
  children?: ReactNode;
}

export function IntlHead({ children }: IntlHeadProps): ReactElement {
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
