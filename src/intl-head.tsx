import { useRouter } from 'next/router';
import React from 'react';
import Head from 'next/head';
import { ReactNode, ReactElement } from 'react';
import { useGetOriginUrl } from './hooks/useGetOriginUrl';
import { useGetAlternateLinks } from './hooks/useGetAlternateLinks';
import { useGetCanonicalUrl } from './hooks/useGetCanonicalUrl';

interface IntlHeadProps {
  children: ReactNode;
  title: string;
  language?: string;
}

export function IntlHead({ children, title, language }: IntlHeadProps): ReactElement {
  const { locale, query, asPath, locales, pathname } = useRouter();

  const canonicalUrl = useGetCanonicalUrl({ locale: language ?? locale, asPath, query });
  const alternateLinks = useGetAlternateLinks({
    locales,
    locale: language ?? locale,
    asPath,
    pathname,
  });
  const origin = useGetOriginUrl();

  return (
    <Head>
      <title>{title}</title>
      {alternateLinks}
      {pathname !== '/' && <link rel="canonical" href={`${origin}${canonicalUrl}`} />}
      {children}
    </Head>
  );
}
