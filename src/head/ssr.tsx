import NextJsHead from 'next/head';
import { useRouter } from 'next/router';
import React, { ReactElement } from 'react';

import {
    containsQueryParameters, getActualLocale, getActualLocales, getQueryParameters, highlight,
    hydrateQueryParameters, log, normalizeLocale
} from '../';
import { getLocalizedUrlFromRewrites } from '../helpers/get-localized-url-from-rewrites';
import { getRewrites } from '../helpers/get-rewrites';

// Throw a clear error is this is included by mistake on the client side.
if (typeof window !== 'undefined') {
  throw new Error(
    '`next-multilingual/head/ssr` must only be used on the server, please use `next-multilingual/head` instead'
  );
}

/**
 * Head is a wrapper around Next.js' `Head` that provides alternate links with localized URLs and a canonical link.
 *
 * @returns The Next.js `Head` component, including alternative links for SEO.
 */
export default function Head({
  children,
}: {
  children: React.ReactNode;
}): ReactElement<typeof NextJsHead> {
  /**
   * Next.js' `<Head>` does not allow components, so we are using hooks. Details here:
   *
   * @see https://github.com/vercel/next.js/issues/17721 (closed issue)
   * @see https://nextjs.org/docs/api-reference/next/head (Next.js documentation)
   *
   * | title, meta or any other elements (e.g., script) need to be contained as direct children of the Head
   * | element, or wrapped into maximum one level of <React.Fragment> or arrays—otherwise the tags won't
   * | be correctly picked up on client-side navigation.
   *
   */
  const { pathname, basePath, defaultLocale, locales, locale, query } = useRouter();

  // Check if it's a dynamic router and if we have all the information to generate the links.
  if (containsQueryParameters(pathname)) {
    const hydratedUrlPath = hydrateQueryParameters(pathname, query, true);
    if (containsQueryParameters(hydratedUrlPath)) {
      const missingParameters = getQueryParameters(hydratedUrlPath);
      log.warn(
        `unable to generate canonical and alternate links for the path ${highlight(
          pathname
        )} because the following query parameter${
          missingParameters.length > 1 ? 's are' : ' is'
        } missing: ${highlight(
          missingParameters.join(',')
        )}. Did you forget to add a 'getStaticPaths' or 'getServerSideProps' to your page?`
      );
      return <NextJsHead>{children}</NextJsHead>;
    }
  }

  const actualLocale = getActualLocale(locale, defaultLocale, locales);
  const actualLocales = getActualLocales(locales, defaultLocale);

  return (
    <NextJsHead>
      <link
        rel="canonical"
        href={getLocalizedUrlFromRewrites(
          getRewrites(),
          { pathname, query },
          actualLocale,
          true,
          basePath
        )}
        key="canonical-link"
      />
      {actualLocales?.map((actualLocale) => {
        return (
          <link
            rel="alternate"
            href={getLocalizedUrlFromRewrites(
              getRewrites(),
              { pathname, query },
              actualLocale,
              true,
              basePath
            )}
            hrefLang={normalizeLocale(actualLocale)}
            key={`alternate-link-${actualLocale}`}
          />
        );
      })}
      {children}
    </NextJsHead>
  );
}
