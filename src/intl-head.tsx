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
  const { locale: lang, query, asPath, locales, pathname, defaultLocale } = useRouter();

  type SupportedLocale = typeof locales[number];
  const isSupportedLocale = (locale: SupportedLocale): boolean => locales.includes(locale);

  const toSupportedLocale = (lang: string): SupportedLocale => {
    if (lang?.length === 2) {
      return locales.find((l) => {
        const [languageCode] = l.split('-');
        return languageCode === lang;
      });
    }
    return isSupportedLocale(lang) ? lang : defaultLocale;
  };

  const locale = toSupportedLocale(language) ?? lang;

  const canonicalUrl = useGetCanonicalUrl({ locale, asPath, query });
  const alternateLinks = useGetAlternateLinks({ locales, locale, asPath, pathname });
  const origin = useGetOriginUrl();

  return (
    <Head>
      <title>{title}</title>
      {alternateLinks}
      {pathname !== '/' && <link rel="canonical" href={`${origin}/${canonicalUrl}`} />}
      {children}
    </Head>
  );
}
