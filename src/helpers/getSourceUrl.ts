import type { Rewrite } from 'next/dist/lib/load-custom-routes';

interface GetSourceUrlProps {
  rewrites: Rewrite[];
  locale: string;
  path: string;
}

export function getSourceUrl({ rewrites, locale, path }: GetSourceUrlProps): string {
  const lcPath = `/${locale}${path}`;
  const match = rewrites.find(
    ({ destination, locale }) => locale === false && destination === lcPath
  );

  return match ? match.source : lcPath;
}
