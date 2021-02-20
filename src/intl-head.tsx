import { useRouter } from 'next/router';
import React from 'react';
import Head from 'next/head';
import { ReactNode, ReactElement } from 'react';
import { useGetAlternateLinks } from './hooks/useGetAlternateLinks';
import { useGetCanonicalUrl } from './hooks/useGetCanonicalUrl';

interface IntlHeadProps {
  children: ReactNode;
  title: string;
  language?: string;
}

export function IntlHead({ children, title, language }: IntlHeadProps): ReactElement {
  const { locale: lang, query, asPath, locales, pathname, defaultLocale } = useRouter();

  type SupportedLocale = typeof locales[number];
  const isSupportedLocale = (locale: SupportedLocale): boolean => locales.includes(locale);
  const toSupportedLocale = (l: SupportedLocale): SupportedLocale =>
    isSupportedLocale(l) ? l : defaultLocale;
  const locale = toSupportedLocale(language) ?? lang;
  console.warn('locale in Intl', locale);
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
