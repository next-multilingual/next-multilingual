import Head from 'next/head';
import React from 'react';
import { useAlternateLinks, AlternateLink } from '../hooks/use-alternate-links';
import { useCanonicalLink } from '../hooks/use-canonical-link';

/**
 * MulHead is a wrapper around Next.js' `Head` that provides alternate links with localized URLs.
 *
 * @returns The Next.js `Head` component, including alternative links for SEO.
 */
export function MulHead({ children }: { children: React.ReactNode }): JSX.Element {
  /**
   * Next.js' `<Head>` does not allow components, so we are using hooks. Details here:
   *
   * - Closed issue: https://github.com/vercel/next.js/issues/17721
   * - Next.js documentation: https://nextjs.org/docs/api-reference/next/head
   *
   * | title, meta or any other elements (e.g. script) need to be contained as direct children of the Head
   * | element, or wrapped into maximum one level of <React.Fragment> or arrays—otherwise the tags won't
   * | be correctly picked up on client-side navigation.
   *
   */
  const alternateLinks = useAlternateLinks();
  const canonicalLink = useCanonicalLink();

  return (
    <Head>
      {alternateLinks.map(({ href, hrefLang, key }: AlternateLink) => {
        return <link rel="alternate" href={href} hrefLang={hrefLang} key={key} />;
      })}
      <link rel="canonical" href={canonicalLink.href} key={canonicalLink.key} />
      {children}
    </Head>
  );
}
