import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getOrigin } from '../helpers/getOrigin';
import { getSourceUrl } from '../helpers/getSourceUrl';
import { useRewrites } from '../hooks/useRewrites';

interface AlterNateLinks {
  href: string;
  hrefLang: string;
}

export const useAlternateLinks = (locale: string): AlterNateLinks[] | null => {
  const { basePath, pathname, locales } = useRouter();
  const rewrites = useRewrites();
  const [alternateLinks, setAlternateLinks] = useState<AlterNateLinks[]>([]);
  const path = `${basePath ?? ''}${pathname}`;

  useEffect(() => {
    const origin = getOrigin();

    /*
      If we are at the root '/' of the website we should build alternate
      links for all the locales
    */
    const alternateLocales = pathname === '/' ? locales : locales.filter((lang) => lang !== locale);
    const alternateLinks = alternateLocales.map((lang) => {
      const alternateLink = getSourceUrl({ rewrites, locale: lang, path });
      return { href: `${origin}${alternateLink}`, hrefLang: lang };
    });
    /*
      If we are at the root '/' of the website we should add an alternate
      link with hreflang = 'x-default'
    */
    setAlternateLinks(
      pathname === '/' ? [...alternateLinks, { href: path, hrefLang: 'x-default' }] : alternateLinks
    );
  }, [locale, locales, path, pathname, rewrites]);

  return alternateLinks;
};
