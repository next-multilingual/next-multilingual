import { useRouter } from 'next/router';
import React from 'react';
import Head from 'next/head';
import { ReactNode, ReactElement } from 'react';
import { useAlternateLinks } from './hooks/useAlternateLinks';
import { useCanonicalUrl } from './hooks/useCanonicalUrl';

interface IntlHeadProps {
  title: string;
  children?: ReactNode;
  language?: string;
}

export function IntlHead({ children, title, language }: IntlHeadProps): ReactElement {
  const { locale } = useRouter();
  const canonicalUrl = useCanonicalUrl(language ?? locale);
  const alternateLinks = useAlternateLinks(language ?? locale);

  return (
    <Head>
      <title>{title}</title>
      {alternateLinks.map(({ href, hrefLang }) => {
        return <link rel="alternate" href={`${href}`} hrefLang={hrefLang} key={hrefLang} />;
      })}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {children}
    </Head>
  );
}
