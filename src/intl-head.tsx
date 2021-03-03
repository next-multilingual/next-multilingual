import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { ReactElement, ReactNode } from 'react';
import { useAlternateLinks } from './hooks/useAlternateLinks';
import { useCanonicalUrl } from './hooks/useCanonicalUrl';

interface IntlHeadProps {
  title: string;
  children?: ReactNode;
  currentLocale?: string;
}

export function IntlHead({ children, title, currentLocale }: IntlHeadProps): ReactElement {
  const { locale } = useRouter();
  const canonicalUrl = useCanonicalUrl(currentLocale ?? locale);
  const alternateLinks = useAlternateLinks(currentLocale ?? locale);

  return (
    <Head>
      <title>{title}</title>
      {alternateLinks.map(({ href, hrefLang }) => (
        <link rel="alternate" href={`${href}`} hrefLang={hrefLang} key={hrefLang} />
      ))}
      <link rel="canonical" href={canonicalUrl} />
      {children}
    </Head>
  );
}
