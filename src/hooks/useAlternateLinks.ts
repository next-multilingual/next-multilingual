import { useRouter } from 'next/router';
import { getBasePath } from '../helpers/getBasePath';
import { getOrigin } from '../helpers/getOrigin';
import { getSourceUrl } from '../helpers/getSourceUrl';
import { useRewrites } from './useRewrites';

interface AlternateLink {
  href: string;
  hrefLang: string;
}

/**
 * A hook to build the alternate links based on the locales defined
 * in next.config.js file
 */
export function useAlternateLinks(): AlternateLink[] {
  const { basePath, pathname, locales } = useRouter();
  const rewrites = useRewrites();

  const origin = getOrigin();
  const alternateLinks = locales.map((lang) => {
    const alternateLink = getSourceUrl({ rewrites, locale: lang, path: pathname });

    return {
      href: `${origin}${getBasePath(basePath)}${removeInitialSlash(alternateLink)}`,
      hrefLang: lang,
    };
  });

  const withPathname = pathname !== '/' ? removeInitialSlash(pathname) : '';

  const _href = `${origin}${getBasePath(basePath)}${withPathname}`;

  return [...alternateLinks, { href: _href, hrefLang: 'x-default' }];
}

/**
 * Removes the first slash from the path
 * @param path { string } - the path to be handled
 */
function removeInitialSlash(path: string): string {
  return path.startsWith('/') ? path.substr(1, path.length) : path;
}
