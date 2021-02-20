import React, { useEffect, useState, ReactElement } from 'react';

import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';

import { getClientBuildManifest } from 'next/dist/client/route-loader';
import type { Rewrite } from 'next/dist/lib/load-custom-routes';

interface RewriteSourceProps {
  path: string;
  locale: string;
}

export function useRewriteSource({ path, locale }: RewriteSourceProps): string {
  const [rewrites, setRewrites] = useState<Rewrite[]>([]);

  useEffect(() => {
    getClientBuildManifest()
      .then((manifest) => {
        // The ClientManifestType is incorrect
        setRewrites((manifest.__rewrites as unknown) as Rewrite[]);
      })
      .catch(console.error);
  }, []);

  const lcPath = `/${locale}${path}`;
  const match = rewrites.find(({ destination, locale }) => {
    return locale === false && destination === lcPath;
  });
  return match ? match.source : path;
}

export function IntlLink({
  href,
  locale,
  ...props
}: LinkProps & { href: string; locale?: string }): ReactElement {
  const router = useRouter();
  const _href = useRewriteSource({ path: href, locale: locale || router.locale });
  return <Link href={_href} locale={locale} {...props} />;
}
