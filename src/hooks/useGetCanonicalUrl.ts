import { ParsedUrlQuery } from 'querystring';
import { useEffect, useState } from 'react';

interface GetCanonicalUrlProps {
  locale: string;
  asPath: string;
  query: ParsedUrlQuery;
}
export const useGetCanonicalUrl = ({ locale, asPath, query }: GetCanonicalUrlProps): string => {
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const queryString = Object.entries(query)
    .map<string>(([key, value]) => `${key}=${value}`)
    .join('&');

  useEffect(() => {
    const pathWithoutTrailingSlash = `${locale}${asPath.toLowerCase()}`.replace(/(\/+)$/, '');
    setCanonicalUrl(`/${pathWithoutTrailingSlash}${queryString ? '?' + queryString : ''}`);
  }, [asPath, locale, queryString]);

  return canonicalUrl;
};
