import { useRouter } from 'next/router';
import { normalizeUrlPath } from '../helpers/normalize-url-path';
import { getOrigin } from '../helpers/get-origin';
import { getActualLocale } from '..';
import { getLocalizedUrlPath } from '../helpers/get-localized-url-path';
import { useRewrites } from './use-rewrites';

/**
 * Canonical links tell search engines what is the URL of a page that should be indexed.
 */
export type CanonicalLink = {
  /** the canonical, fully-qualified URL of a page. */
  href: string;
  /** The unique key to use in Next.js `<Head>`. */
  key: string;
};

/**
 * A hook to get the canonical link of your current page.
 *
 * A canonical link tell the search engines which page to index to avoid "page collisions". This is especially important
 * with Next.js as URLs casing is not always sensitive which could cause problems when indexing. URL queries are ignore by
 * design to avoid duplicate content penalties with search engines.
 *
 * @returns A string containing the HTML markup of the required canonical link of the current page.
 */
export function useCanonicalLink(): CanonicalLink {
  const { basePath, pathname, defaultLocale, locale, locales, route } = useRouter();
  const rewrites = useRewrites();
  const origin = getOrigin();
  const normalizedBasePath = normalizeUrlPath(basePath);

  const actualLocale = getActualLocale(locale, defaultLocale, locales);
  const key = 'canonical-link';

  if (route === '/') {
    const localePrefix = `/${actualLocale.toLowerCase()}`;
    const href = `${origin}${normalizedBasePath}${localePrefix}`;
    return {
      href,
      key,
    };
  } else {
    const localizedUrlPath = getLocalizedUrlPath(rewrites, actualLocale, pathname);
    const href = `${origin}${normalizedBasePath}${localizedUrlPath}`;
    return {
      href,
      key,
    };
  }
}
