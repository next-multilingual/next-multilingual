import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getBasePath } from '../helpers/getBasePath';
import { getOrigin } from '../helpers/getOrigin';
import { getSourceUrl } from '../helpers/getSourceUrl';
import { useRewrites } from './useRewrites';

interface AlternateLink {
  href: string;
  hrefLang: string;
}

export const useAlternateLinks = (currentLocale: string): AlternateLink[] => {
  const { basePath, pathname, locales } = useRouter();
  const rewrites = useRewrites();
  const [alternateLinks, setAlternateLinks] = useState<AlternateLink[]>([]);

  useEffect(() => {
    const origin = getOrigin();
    const alternateLinks = locales.map((lang) => {
      const alternateLink = getSourceUrl({ rewrites, locale: lang, path: pathname });
      return {
        href: `${origin}${getBasePath(basePath)}${lang}${alternateLink}`,
        hrefLang: lang,
      };
    });
    setAlternateLinks(
      pathname !== '/'
        ? alternateLinks
        : [...alternateLinks, { href: `${origin}${getBasePath(basePath)}`, hrefLang: 'x-default' }]
    );
  }, [basePath, currentLocale, locales, pathname, rewrites]);

  return alternateLinks;
};
