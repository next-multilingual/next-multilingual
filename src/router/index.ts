import type { Rewrite, Redirect } from 'next/dist/lib/load-custom-routes';
import { readdirSync, readFileSync } from 'fs';
import { basename, extname, posix, resolve, parse as parsePath } from 'path';
import { parse as parseProperties } from 'dot-properties';
import { getActualLocales } from '..';

export class MultilingualRoute {
  /** A unique multilingual route identifier. */
  public identifier: string;
  /** An array of localized URL path objects. */
  public localizedUrlPaths: LocalizedUrlPath[] = [];

  /**
   * A unique route entry, including its localized URL paths.
   *
   * @param identifier - the unique multilingual route identifier.
   */
  constructor(identifier: string) {
    this.identifier = identifier;
  }

  /**
   * Get a localized URL path.
   *
   * @param locale - The locale of the the path.
   *
   * @returns The localize URL path.
   */
  public getLocalizedUrlPath(locale: string): string {
    const localizedUrlPath = this.localizedUrlPaths.find(
      (localizedUrlPath) => localizedUrlPath.locale === locale
    );
    return localizedUrlPath.urlPath;
  }
}

/**
 * An object that represents a localized URL path.
 */
export type LocalizedUrlPath = {
  /** The locale of the URL path. */
  locale: string;
  /** The localized URL path. */
  urlPath: string;
};

export class MulRouter {
  /** The locales. */
  private readonly locales: string[];
  /** The actual locales used by the router. */
  private readonly actualLocales: string[];
  /** The default locale. */
  private readonly defaultLocale: string;
  /** The directory path where the Next.js pages can be found. */
  private readonly pagesDirectoryPath: string;
  /** The file extensions of the Next.js pages. */
  private readonly pagesExtensions: string[];
  /** The files to exclude within the pages directory path. */
  private readonly excludedPages: string[];

  /** A cache of multilingual routes. */
  private routeCache?: MultilingualRoute[];

  /**
   * A multilingual router.
   *
   * All URLs will be transformed to their lowercase form, including Next.js' i18n locales. In general, it is recommended
   * to keep consistency across URLs since they are case sensitive. Having only a single resource pointing to a case-insensitive
   * URL is considered a good practice as long as a canonical form is provided. In this case the lowercase form will be used
   * as canonical since Next.js is case-insensitive.
   *
   * @param locales - The locales configured for Next.js.
   * @param pagesDirectoryPath - The router looks for files in the `pages` directory by default but can be overwritten.
   * @param pagesExtensions - The router looks for `.tsx` files by default but can be overwritten.
   * @param excludedPages - Exclude "special" Next.js pages (e.g. _app.tsx) by default but can be overwritten.
   *
   * @throws Error when the default locale is not included in the locales.
   */
  constructor(
    locales: string[],
    pagesDirectoryPath = 'pages',
    pagesExtensions = ['.tsx'],
    excludedPages = ['_app', '_document', '_error', '404']
  ) {
    this.defaultLocale = locales[0];
    this.actualLocales = getActualLocales(locales, this.defaultLocale);
    this.locales = locales;

    this.pagesDirectoryPath = pagesDirectoryPath;
    if (pagesExtensions?.length) {
      this.pagesExtensions = pagesExtensions.map((ext) => (ext.startsWith('.') ? ext : `.${ext}`));
    }
    this.excludedPages = excludedPages;
    this.routeCache = this.getRoutes();
  }

  /**
   * Get the URL locale prefixes.
   *
   * @return The locales prefixes, all in lowercase.
   */
  public getUrlLocalePrefixes(): string[] {
    return this.locales.map((locale) => locale.toLowerCase());
  }

  /**
   * Get the URL default locale prefix.
   *
   * @return The default locale prefix, in lowercase.
   */
  public getDefaultUrlLocalePrefix(): string {
    return this.defaultLocale.toLowerCase();
  }

  /**
   * Returns the Next.js routes from a specific directory.
   *
   * @param directoryPath - The directory to read the files from.
   *
   * @return The Next.js routes.
   */
  private getRoutes(directoryPath = this.pagesDirectoryPath): MultilingualRoute[] {
    const routes: MultilingualRoute[] = [];

    readdirSync(directoryPath, { withFileTypes: true }).forEach((directoryEntry) => {
      const directoryEntryPath = resolve(directoryPath, directoryEntry.name);
      if (!directoryEntry.isDirectory()) {
        // Create new routes for matching files.
        const directoryEntryExtension = extname(directoryEntryPath);

        if (this.pagesExtensions.includes(directoryEntryExtension)) {
          const identifier = basename(directoryEntryPath, directoryEntryExtension);

          if (!this.excludedPages.includes(identifier)) {
            const route = new MultilingualRoute(identifier);

            this.actualLocales.forEach((locale) => {
              const urlPath = this.getLocalizedUrlPathSegment(directoryEntryPath, locale);
              route.localizedUrlPaths.push({
                locale,
                urlPath,
              });
            });

            if (route.localizedUrlPaths.length) routes.push(route);
          }
        }
      } else {
        // Get child routes recursively when on directories.
        const childRoutes = this.getRoutes(directoryEntryPath);
        const childIndexRoute = childRoutes.find((route) => route.identifier === 'index');

        childRoutes.forEach((childRoute) => {
          if (childRoute === childIndexRoute) {
            childIndexRoute.identifier = directoryEntry.name; // Replace `index` with the proper route name.
          } else {
            // Add parent directory entry name to the unique route identifier.
            childRoute.identifier = posix.join(directoryEntry.name, childRoute.identifier);

            childRoute.localizedUrlPaths.forEach((localizedUrlPath) => {
              // Find the localized URL path of the index if present, otherwise use the parent directory entry name.
              const indexRouteUrlPath = childIndexRoute?.getLocalizedUrlPath(
                localizedUrlPath.locale
              );

              const routeDirectory = indexRouteUrlPath || directoryEntry.name;
              localizedUrlPath.urlPath = posix.join(routeDirectory, localizedUrlPath.urlPath);
            });
          }
          routes.push(childRoute);
        });
      }
    });

    return routes;
  }

  /**
   * Get a localized URL path segment.
   *
   * @param filePath - The file path from where to get the segment.
   * @param locale - The locale of the URL segment.
   *
   * @return The localized URL path segment.
   */
  private getLocalizedUrlPathSegment(filePath: string, locale: string): string {
    const { dir: directoryPath, name: identifier } = parsePath(filePath);

    const stringsFilePath = resolve(directoryPath, `${identifier}.${locale}.properties`);

    let title: string;
    const stringsFileContent = readFileSync(stringsFilePath, 'utf8');
    title = parseProperties(stringsFileContent).title as string;
    title = title.replace(/[ /-]+/g, '-');
    return title;
  }

  /**
   * Encode a URL path.
   *
   * @param urlPath - The URL path.
   *
   * @returns The encoded URL path.
   */
  private encodeUrlPath(urlPath: string): string {
    return encodeURIComponent(urlPath).replace(/%2F/g, '/');
  }

  /**
   * Normalizes the path based on the locale and case.
   *
   * @param locale - The locale of the path.
   * @param urlPath - The URL path (excluding the locale from the path).
   * @param encode - Set to `true` to return an encode URL (by default it's not encoded)
   *
   * @returns The normalized path with the locale.
   */
  private normalizeUrlPath(locale: string, urlPath: string, encode = false): string {
    const normalizedUrlPath = `/${locale}/${urlPath}`.toLocaleLowerCase(locale);

    if (encode) {
      // Normalize to NFC as per https://tools.ietf.org/html/rfc3987#section-3.1
      return this.encodeUrlPath(normalizedUrlPath);
    }

    return normalizedUrlPath;
  }

  /**
   * Get Next.js rewrites directives.
   *
   * @returns An array of Next.js `Rewrite` objects.
   */
  public getRewrites(): Rewrite[] {
    const rewrites = [];
    for (const route of this.routeCache) {
      for (const locale of this.actualLocales) {
        const source = this.normalizeUrlPath(locale, route.getLocalizedUrlPath(locale), true);
        const destination = this.normalizeUrlPath(locale, route.identifier);

        if (source !== destination) {
          rewrites.push({
            source,
            destination,
            locale: false,
          });
        }
      }
    }
    return rewrites;
  }

  /**
   * Get Next.js redirects directives.
   *
   * @returns An array of Next.js `Redirect` objects.
   */
  public getRedirects(): Redirect[] {
    const redirects = [];
    for (const route of this.routeCache) {
      for (const locale of this.actualLocales) {
        const source = this.normalizeUrlPath(locale, route.getLocalizedUrlPath(locale));
        const canonical = source.normalize('NFC');
        const alreadyIncluded = [canonical];
        for (const alternative of [
          source, // UTF-8
          source.normalize('NFD'),
          source.normalize('NFKC'),
          source.normalize('NFKD'),
          this.normalizeUrlPath(locale, route.identifier).normalize('NFC'),
        ]) {
          if (!alreadyIncluded.includes(alternative) && canonical !== alternative) {
            redirects.push({
              source: this.encodeUrlPath(alternative),
              destination: this.encodeUrlPath(canonical),
              locale: false,
              permanent: true,
            });
            alreadyIncluded.push(alternative);
          }
        }
      }
    }
    return redirects;
  }
}
