import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getBasePath } from '../helpers/getBasePath';
import { getOrigin } from '../helpers/getOrigin';
import { getSourceUrl } from '../helpers/getSourceUrl';
import { useRewrites } from './useRewrites';
import { removeFirstSlash } from '../helpers/paths';

interface AlternateLink {
  href: string;
  hrefLang: string;
}

export const useAlternateLinks = (locale: string): AlternateLink[] => {
  const { basePath, pathname, locales, defaultLocale } = useRouter();
  const rewrites = useRewrites();
  const [alternateLinks, setAlternateLinks] = useState<AlternateLink[]>([]);

  useEffect(() => {
    const origin = getOrigin();
    const alternateLinks = locales
      .map((lang) => {
        const alternateLink = getSourceUrl({ rewrites, locale: lang, path: pathname });
        return {
          href: `${origin}${getBasePath(basePath)}${removeFirstSlash(alternateLink)}`,
          hrefLang: lang,
        };
      });

    const withPathname = pathname !== '/'
      ? removeFirstSlash(pathname)
      : ''

    const _href = `${origin}${getBasePath(basePath)}${withPathname}`
    setAlternateLinks([...alternateLinks, { href: _href, hrefLang: 'x-default' }]
    );
  }, [basePath, locales, pathname, rewrites]);

  return alternateLinks;
};
