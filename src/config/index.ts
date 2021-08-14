import type { Rewrite, Redirect } from 'next/dist/lib/load-custom-routes';
import { readdirSync } from 'fs';
import { basename, extname, posix, resolve, parse as parsePath } from 'path';
import { isLocale, normalizeLocale } from '..';
import { parsePropertiesFile } from '../messages/properties';

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

export class MulConfig {
  /** The unique application identifier that will be used as a messages key prefix. */
  readonly applicationIdentifier: string;
  /** The actual desired locales of the multilingual application. */
  private readonly actualLocales: string[];

  /** The locales used by the Next.js configuration. */
  private readonly locales: string[];
  /** The default locale used by the Next.js configuration. */
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
   * A multilingual configuration handler.
   *
   * @param applicationIdentifier - The unique application identifier that will be used as a messages key prefix.
   * @param locales - The actual desired locales of the multilingual application.
   * @param pagesDirectoryPath - Specify where yor `pages` directory is, when not using the Next.js default location.
   * @param pagesExtensions - Specify the file extensions used by your pages if different than `.tsx` and `.jsx`.
   * @param excludedPages - Specify pages to excluded if different than the ones used by Next.js (e.g. _app.tsx).
   *
   * @throws Error when the locale identifier is invalid.
   */
  constructor(
    applicationIdentifier: string,
    locales: string[],
    pagesDirectoryPath = 'pages',
    pagesExtensions = ['.tsx', '.jsx'],
    excludedPages = ['_app', '_document', '_error', '404']
  ) {
    // Set the application identifier if valid.
    if (!/^[a-z\d]+$/i.test(applicationIdentifier)) {
      throw new Error(
        `invalid application identifier '${applicationIdentifier}'. Only alphanumeric characters are allowed.`
      );
    }
    this.applicationIdentifier = applicationIdentifier;

    // Verify if the locale identifiers are using the right format.
    locales.forEach((locale) => {
      if (!isLocale(locale)) {
        throw new Error(
          "invalid locale '" +
            locale +
            "' . `next-multilingual` only uses locale identifiers following the `language`-`country` format."
        );
      }
    });

    // Set the actual desired locales of the multilingual application.
    this.actualLocales = locales.map((locale) => normalizeLocale(locale));
    // The `mul` (multilingual) default locale is required for dynamic locale resolution for requests on `/`.
    this.defaultLocale = 'mul';
    // By convention, the first locale configured in Next.js will be the default locale.
    this.locales = [this.defaultLocale, ...this.actualLocales];

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
    const propertiesFilePath = resolve(directoryPath, `${identifier}.${locale}.properties`);
    return parsePropertiesFile(propertiesFilePath).title.replace(/[ /-]+/g, '-');
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

/**
 * Returns the Next.js multilingual config.
 *
 * @param applicationIdentifier - The unique application identifier that will be used as a messages key prefix.
 * @param locales - The actual desired locales of the multilingual application.
 * @param options - Next.js configuration options.
 * @param pagesDirectoryPath - Specify where yor `pages` directory is, when not using the Next.js default location.
 * @param pagesExtensions - Specify the file extensions used by your pages if different than `.tsx` and `.jsx`.
 * @param excludedPages - Specify pages to excluded if different than the ones used by Next.js (e.g. _app.tsx).
 *
 * Note that conflicting options required by `next-multilingual` will be overwritten. For advanced configuration, please
 * user the `MulConfig`.
 *
 * @return The Next.js routes.
 *
 * @throws Error when the locale identifier or config is invalid.
 */
export function getMulConfig(
  applicationIdentifier: string,
  locales: string[],
  options:
    | Record<string, unknown>
    | ((phase: string, defaultConfig: Record<string, unknown>) => void),
  pagesDirectoryPath?: string,
  pagesExtensions?: string[],
  excludedPages?: string[]
): Record<string, unknown> {
  if (options instanceof Function) {
    throw new Error('Function config is not supported. Please use the `MulConfig` object instead');
  }

  ['serverRuntimeConfig', 'i18n', 'webpack', 'rewrites', 'redirects'].forEach((option) => {
    if (options[option] !== undefined) {
      throw new Error(
        `the \`${option}\` option is not supported by \`getMulConfig\`. Please use the \`MulConfig\` object instead`
      );
    }
  });

  const config = options ? options : {};
  const mulConfig = new MulConfig(
    applicationIdentifier,
    locales,
    pagesDirectoryPath,
    pagesExtensions,
    excludedPages
  );

  // Sets the unique application identifier.
  config.serverRuntimeConfig = {
    nextMultilingual: {
      applicationIdentifier: mulConfig.applicationIdentifier,
    },
  };

  // Sets lowercase locales used as URL prefixes, including the default 'mul' locale used for language detection.
  config.i18n = {
    locales: mulConfig.getUrlLocalePrefixes(),
    defaultLocale: mulConfig.getDefaultUrlLocalePrefix(),
    localeDetection: false, // This is important to use the improved language detection feature.
  };

  // Set Webpack config.
  config.webpack = (config, { isServer }) => {
    // Overwrite the `link` component for SSR.
    if (isServer) {
      config.resolve.alias['next-multilingual/link$'] = require.resolve(
        'next-multilingual/link/ssr'
      );
    }
    return config;
  };

  // Sets localized URLs as rewrites rules.
  config.rewrites = async () => {
    return mulConfig.getRewrites();
  };

  // Sets redirect rules to normalize URL encoding.
  config.redirects = async () => {
    return mulConfig.getRedirects();
  };

  return config;
}
