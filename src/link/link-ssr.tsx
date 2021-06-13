import { readFileSync } from 'fs';

import type { Rewrite } from 'next/dist/lib/load-custom-routes';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { resolve } from 'path';

import React, { ReactElement } from 'react';

import { getLocalizedUrl } from '../helpers/getLocalizedUrl';

console.log('!!!! SSSR !!!!');

type ManifestRewrites = {
  afterFiles: Rewrite[];
};

let __rewrites: Rewrite[] = null;

function getRewrites(): Rewrite[] {
  if (__rewrites) return __rewrites;
  const bmPath = resolve('.next', 'build-manifest.json');
  console.log(`bmPath: ${bmPath}`);
  const bmSrc = readFileSync(bmPath, 'utf8');
  console.log(`bmSrc: ${bmSrc}`);
  const cmName = (JSON.parse(bmSrc).lowPriorityFiles as string[]).find((fn) =>
    fn.includes('_buildManifest.js')
  );
  console.log(`cmName:`);
  console.dir(cmName);

  const cmSrc = readFileSync(resolve('.next', cmName), 'utf8');
  console.log(`cmSrc: ${bmSrc}`);
  const self = {} as { __BUILD_MANIFEST: { __rewrites: ManifestRewrites } };
  new Function('self', cmSrc)(self);

  return (__rewrites = self.__BUILD_MANIFEST.__rewrites.afterFiles);
}

export function MulLink({
  href,
  locale,
  ...props
}: LinkProps & { href: string; locale?: string }): ReactElement {
  const router = useRouter();
  locale = locale ? locale : router.locale;
  const sourceUrl = getLocalizedUrl(getRewrites(), locale, href);
  return <Link href={sourceUrl} locale={locale} {...props} />;
}
