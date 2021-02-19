import React, { ReactElement } from 'react';

interface GetAlternateLinks {
  locales: string[];
  locale: string;
  asPath: string;
}

export const getAlternateLinks = ({
  locales,
  locale,
  asPath,
}: GetAlternateLinks): ReactElement[] => {
  const alternateLocales = locales.filter((lang) => lang !== locale);
  const routeWithoutLocale = asPath.substr(locale.length + 1);
  return alternateLocales.map((lang) => {
    return (
      <link
        rel="alternate"
        href={`http://localhost/${lang}${routeWithoutLocale}`}
        hrefLang={lang}
        key={lang}
      />
    );
  });
};
