import { getMatchingUrl } from '../helpers/getMatchingUrl';
import { useRewrites } from '../hooks/useRewrites';

export interface RewriteSourceProps {
  path: string;
  locale: string;
}

export function useRewriteSource({ path, locale }: RewriteSourceProps): string {
  const rewrites = useRewrites();

  return getMatchingUrl({ rewrites, path, locale });
}
