import { readFileSync } from 'fs';

import type { Rewrite } from 'next/dist/lib/load-custom-routes';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { resolve } from 'path';

import React, { ReactElement } from 'react';

let __rewrites: Rewrite[] = null;

function getRewrites(): Rewrite[] {
  if (__rewrites) return __rewrites;
  const bmPath = resolve('.next', 'build-manifest.json');
  const bmSrc = readFileSync(bmPath, 'utf8');
  const cmName = (JSON.parse(bmSrc).lowPriorityFiles as string[]).find((fn) =>
    fn.includes('_buildManifest.js')
  );
  const cmSrc = readFileSync(resolve('.next', cmName), 'utf8');
  const self = {} as { __BUILD_MANIFEST: { __rewrites: Rewrite[] } };
  new Function('self', cmSrc)(self);
  return (__rewrites = self.__BUILD_MANIFEST.__rewrites);
}

function useRewriteSource(path: string, locale: string): string {
  const rewrites = getRewrites();
  const lcPath = `/${locale}${path}`;
  const match = rewrites.find(
    ({ destination, locale }) => locale === false && destination === lcPath
  );
  return match ? match.source : path;
}

export function IntlLink({
  href,
  locale,
  ...props
}: LinkProps & { href: string; locale?: string }): ReactElement {
  const router = useRouter();
  const _href = useRewriteSource(href, locale || router.locale);
  return <Link href={_href} locale={locale} {...props} />;
}
