import { useRouter } from 'next/router';
import { getBasePath } from '../helpers/getBasePath';
import { getOrigin } from '../helpers/getOrigin';

export const useCanonicalUrl = (locale: string): string | null => {
  const { asPath, basePath } = useRouter();
  const [path, query] = asPath.split('?');
  const origin = getOrigin();
  // new URLSearchParams will make sure that any special character will be parsed
  const queryString = new URLSearchParams(query).toString();

  return `${origin}${getBasePath(basePath)}${locale}${path}${queryString ? '?' + queryString : ''}`;
};
