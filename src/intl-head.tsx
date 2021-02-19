import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { ReactNode, ReactElement } from 'react';
import { getAlternateLinks } from './helpers/links';
import { getCanonicalUrl } from './helpers/urls';

interface IntlHeadProps {
  children: ReactNode;
  title: string;
}

export function IntlHead({ children, title }: IntlHeadProps): ReactElement {
  const { locale, query, asPath, pathname, locales, basePath } = useRouter();
  const [canonicalUrl, setCanonicalUrl] = useState('');
  console.warn('locale', locale);
  console.warn('pathname', pathname);
  console.warn('asPath', asPath);
  console.warn('basePath', basePath);

  useEffect(() => {
    setCanonicalUrl(getCanonicalUrl({ locale, query, asPath }));
  }, [locale, pathname, query]);

  console.warn('canonicalUrl', canonicalUrl);
  const alternateLinks = getAlternateLinks({ locales, locale, asPath });

  return (
    <Head>
      <title>{title}</title>
      {alternateLinks}
      <link rel="canonical" href={`http://localhost${canonicalUrl}`} />
      {children}
    </Head>
  );
}
