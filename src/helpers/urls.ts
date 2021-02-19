import { ParsedUrlQuery } from 'querystring';

interface GetCanonicalUrlProps {
  locale: string;
  asPath: string;
  query: ParsedUrlQuery;
}
export const getCanonicalUrl = ({ locale, asPath, query }: GetCanonicalUrlProps): string => {
  const queryString = Object.entries(query)
    .map<string>(([key, value]) => `${key}=${value}`)
    .join('&');

  const pathWithoutTrailingSlash = `${locale}${asPath}`.replace(/(\/+)$/, '');
  return `/${pathWithoutTrailingSlash}${queryString ? '?' + queryString : ''}`;
};
