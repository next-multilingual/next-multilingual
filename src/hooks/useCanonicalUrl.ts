import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getOrigin } from '../helpers/getOrigin';

export const useCanonicalUrl = (locale: string): string | null => {
  const { asPath, basePath, pathname } = useRouter();
  const [canonicalUrl, setCanonicalUrl] = useState<string | null>(null);
  const fullPath = `${basePath ?? ''}${asPath}`;
  const [path, query] = fullPath.split('?');
  const origin = getOrigin();
  // new URLSearchParams will make sure that any special character will be parsed
  const queryString = new URLSearchParams(query).toString();

  useEffect(() => {
    if (pathname !== '/') {
      setCanonicalUrl(`${origin}/${locale}${path}${queryString ? '?' + queryString : ''}`);
    }
  }, [asPath, locale, origin, path, pathname, queryString]);

  return canonicalUrl;
};
