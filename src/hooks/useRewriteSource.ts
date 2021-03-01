import { getSourceUrl } from 'helpers/getSourceUrl';
import { useRewrites } from 'hooks/useRewrites';

export interface RewriteSourceProps {
  path: string;
  locale: string;
}

export function useRewriteSource({ path, locale }: RewriteSourceProps): string {
  const rewrites = useRewrites();

  return getSourceUrl({ rewrites, path, locale });
}
