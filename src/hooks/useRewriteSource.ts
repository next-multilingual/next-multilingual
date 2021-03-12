import { getSourceUrl } from '../helpers/getSourceUrl';
import { useRewrites } from '../hooks/useRewrites';

export interface RewriteSourceProps {
  path: string;
  locale: string;
}

/**
 *
 * @param path - the path from which we'll get the localized URL
 * @param locale - the locale we want to retrieve the localized URL for
 * @returns { string } - returns the localized URL
 */
export function useRewriteSource({ path, locale }: RewriteSourceProps): string {
  const rewrites = useRewrites();
  return getSourceUrl({ rewrites, path, locale });
}
