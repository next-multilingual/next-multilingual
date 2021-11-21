import NextHead from 'next/head';
import React from 'react';
import { useAlternateLinks, AlternateLink } from '../hooks/use-alternate-links';
import { useCanonicalLink } from '../hooks/use-canonical-link';

/**
 * Head is a wrapper around Next.js' `Head` that provides alternate links with localized URLs and a canonical link.
 *
 * @returns The Next.js `Head` component, including alternative links for SEO.
 */
export default function Head({ children }: { children: React.ReactNode }): JSX.Element {
  /**
   * Next.js' `<Head>` does not allow components, so we are using hooks. Details here:
   *
   * @see https://github.com/vercel/next.js/issues/17721 (closed issue)
   * @see https://nextjs.org/docs/api-reference/next/head (Next.js documentation)
   *
   * | title, meta or any other elements (e.g. script) need to be contained as direct children of the Head
   * | element, or wrapped into maximum one level of <React.Fragment> or arrays—otherwise the tags won't
   * | be correctly picked up on client-side navigation.
   *
   */
  const alternateLinks = useAlternateLinks();
  const canonicalLink = useCanonicalLink();

  return (
    <NextHead>
      <link rel="canonical" href={canonicalLink.href} key={canonicalLink.key} />
      {alternateLinks.map(({ href, hrefLang, key }: AlternateLink) => {
        return <link rel="alternate" href={href} hrefLang={hrefLang} key={key} />;
      })}
      {children}
    </NextHead>
  );
}
