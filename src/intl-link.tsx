import React, { ReactElement } from 'react';

import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { useRewriteSource } from 'hooks/useRewriteSource';

export function IntlLink({
  href,
  locale,
  ...props
}: LinkProps & { href: string; locale?: string }): ReactElement {
  const router = useRouter();
  const _href = useRewriteSource({ path: href, locale: locale || router.locale });
  return <Link href={_href} locale={locale} {...props} />;
}
