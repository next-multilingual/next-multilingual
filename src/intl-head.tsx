import { useRouter } from 'next/router';
import React from 'react';
import Head from 'next/head';
import { ReactNode, ReactElement } from 'react';
import { useGetAlternateLinks } from './hooks/useGetAlternateLinks';
import { useGetCanonicalUrl } from './hooks/useGetCanonicalUrl';

interface IntlHeadProps {
  children: ReactNode;
  title: string;
}

export function IntlHead({ children, title }: IntlHeadProps): ReactElement {
  const { locale, query, asPath, locales, pathname } = useRouter();
  const canonicalUrl = useGetCanonicalUrl({ locale, asPath, query });
  const alternateLinks = useGetAlternateLinks({ locales, locale, asPath, pathname });

  return (
    <Head>
      <title>{title}</title>
      {alternateLinks}
      {pathname !== '/' && <link rel="canonical" href={`http://localhost${canonicalUrl}`} />}
      {children}
    </Head>
  );
}
