import React, { ReactElement } from 'react';

import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { useRewriteSource } from './hooks/useRewriteSource';

/**
 * IntlLink is a wrapper around Link what will grab the localized path based on the locale
 * @param href - a localized path
 * @param locale - the locale to grab the correct localized path
 * @param props - { LinkProps }
 * @returns { ReactElement } - returns the Link component where the href will point to the  localized path
 */
export function IntlLink({
  href,
  locale,
  ...props
}: LinkProps & { href: string; locale?: string }): ReactElement {
  const router = useRouter();
  const source = useRewriteSource({
    path: href,
    locale: locale || router.locale,
  });
  const _href = locale === router.defaultLocale ? `/${locale}${source}` : source;
  return <Link href={_href} locale={locale} {...props} />;
}
