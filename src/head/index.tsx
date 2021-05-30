import Head from 'next/head';
import React, { ReactElement, ReactNode } from 'react';
import { useAlternateLinks } from '../hooks/useAlternateLinks';

interface MulHeadProps {
  children?: ReactNode;
}

export function MulHead({ children }: MulHeadProps): ReactElement {
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
