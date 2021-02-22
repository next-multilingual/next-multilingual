import React, { ReactElement, useEffect, useState } from 'react';
import { getMatchingUrl } from '../helpers/getMatchingUrl';
import { useRewrites } from '../hooks/useRewrites';
import { useGetOriginUrl } from '../hooks/useGetOriginUrl';

interface GetAlternateLinks {
  locales: string[];
  locale: string;
  asPath: string;
  pathname: string;
}

export const useGetAlternateLinks = ({
  locales,
  locale,
  asPath,
  pathname,
}: GetAlternateLinks): ReactElement[] | null => {
  const rewrites = useRewrites();
  const [alternateLinks, setAlternateLinks] = useState<ReactElement[]>([]);
  const origin = useGetOriginUrl();

  useEffect(() => {
    const alternateLocales = locales.filter((lang) => lang !== locale);
    setAlternateLinks(
      alternateLocales.map((lang) => {
        const alternateLink = getMatchingUrl({ rewrites, locale: lang, path: pathname });
        return (
          <link rel="alternate" href={`${origin}/${alternateLink}`} hrefLang={lang} key={lang} />
        );
      })
    );

    if (asPath === '/') {
      setAlternateLinks((x) => [
        ...x,
        <link rel="alternate" href={origin} hrefLang="x-default" key="x-default" />,
        <link rel="alternate" href={`${origin}/${locale}`} hrefLang={locale} key={locale} />,
      ]);
    }
  }, [asPath, locale, locales, origin, pathname, rewrites]);

  return alternateLinks;
};
