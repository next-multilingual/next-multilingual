import { useRouter } from 'next/router';
import { getBasePath } from '../helpers/get-base-path';
import { getOrigin } from '../helpers/get-origin';
import { getLocalizedUrl } from '../helpers/get-localized-url';
import { useRewrites } from './use-rewrites';

interface AlternateLink {
  href: string;
  hrefLang: string;
}

/**
 * A hook to build the alternate links based on the locales defined
 * in next.config.js file
 */
export function useAlternateLinks(): AlternateLink[] {
  const { basePath, pathname: urlPath, locales } = useRouter();
  const rewrites = useRewrites();

  const origin = getOrigin();
  const alternateLinks = locales.map((locale) => {
    const alternateLink = getLocalizedUrl(rewrites, locale, urlPath);

    return {
      href: `${origin}${getBasePath(basePath)}${removeInitialSlash(alternateLink)}`,
      hrefLang: locale,
    };
  });

  const withPathname = urlPath !== '/' ? removeInitialSlash(urlPath) : '';

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
