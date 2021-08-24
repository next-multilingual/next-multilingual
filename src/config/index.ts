import type { Rewrite, Redirect } from 'next/dist/lib/load-custom-routes';
import { existsSync, readdirSync, utimesSync } from 'fs';
import { extname, resolve, parse as parsePath, sep as pathSeparator } from 'path';
import { isLocale, normalizeLocale } from '..';
import { parsePropertiesFile } from '../messages/properties';
import { keySegmentRegExp } from '../messages';

import type { NextConfig } from 'next';
import chokidar from 'chokidar';

/**
 * Escapes a regular expression string.
 *
 * @param regexp - The regular expression string.
 *
 * @returns An escaped regular expression.
 */
function escapeRegExp(regexp: string): string {
  return regexp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Transforms a file system path to a URL path, regardless of the operating system.
 *
 * @param path - The file path coming from Node's `fs` API.
 *
 * @returns A URL path.
 */
function fileSystemPathToUrlPath(path: string): string {
  const regexp = new RegExp(`[${escapeRegExp(pathSeparator)}]`, 'g');
  return path.replace(regexp, '/');
}

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
   * @param applicationIdentifier - The unique application identifier that will be used as a messages key prefix. Must be between 3 to 50 alphanumerical characters.
   * @param locales - The actual desired locales of the multilingual application. The first locale will be the default locale. Only BCP 47 language tags following the `language`-`country` format are accepted.
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
    if (!keySegmentRegExp.test(applicationIdentifier)) {
      throw new Error(
        `invalid application identifier '${applicationIdentifier}'. Application identifiers must be between 3 and 50 alphanumerical character.`
      );
    }
    this.applicationIdentifier = applicationIdentifier;
    // Manually add to environment variables so that it is available at build time, without extra config.
    process.env.nextMultilingualApplicationIdentifier = this.applicationIdentifier;

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

    this.pagesDirectoryPath = resolve(pagesDirectoryPath);
    if (pagesExtensions?.length) {
      this.pagesExtensions = pagesExtensions.map((extension) =>
        extension.startsWith('.') ? extension : `.${extension}`
      );
    }
    this.excludedPages = excludedPages.map((excludedPage) =>
      resolve(this.pagesDirectoryPath, excludedPage)
    );

    this.routeCache = this.getRoutes();

    // During development, add an extra watcher to trigger recompile when a `.properties` file changes.
    if (process.env.NODE_ENV === 'development') {
      chokidar
        .watch('./**/*.properties', {
          ignored: ['node_modules', '.next'],
          ignoreInitial: true,
        })
        .on('all', (event, path) => {
          const propertiesFile = parsePath(resolve(process.cwd(), path));
          const relatedFilename = propertiesFile.name.split('.').slice(0, -1).join('.');

          for (const relatedFileExtension of ['tsx', 'ts', 'jsx', 'js']) {
            const relatedFilePath = resolve(
              propertiesFile.dir,
              `${relatedFilename}.${relatedFileExtension}`
            );
            if (existsSync(relatedFilePath)) {
              // "touch" the file without any changes to trigger recompile.
              utimesSync(relatedFilePath, new Date(), new Date());
              break;
            }
          }
        });
    }
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
   * Check if a given directory contains pages.
   *
   * @param directoryPath - The path of the directory.
   *
   * @returns True if there is at least one page, otherwise false.
   */
  private directoryContainsPages(directoryPath: string): boolean {
    let pagesFound = 0;
    readdirSync(directoryPath, { withFileTypes: true }).forEach((directoryEntry) => {
      if (directoryEntry.isFile()) {
        const directoryEntryPath = resolve(directoryPath, directoryEntry.name);
        const directoryEntryExtension = extname(directoryEntryPath);

        if (!this.pagesExtensions.includes(directoryEntryExtension)) {
          return; // Skip this file if the extension is not in scope.
        }

        const pageFile = parsePath(directoryEntryPath);
        const pagePathWithoutExtension = resolve(pageFile.dir, pageFile.name);

        if (this.excludedPages.includes(pagePathWithoutExtension)) {
          return; // Skip this file if it's excluded.
        }

        pagesFound++;
      }
    });
    return !!pagesFound;
  }

  /**
   * Returns the Next.js routes from a specific directory.
   *
   * @param baseDirectoryPath - The base directory to read the files from (this should be the `pages` directory).
   * @param currentDirectoryPath - The directory being currently inspected for route.
   *
   * @return The Next.js routes.
   */
  private getRoutes(
    baseDirectoryPath = this.pagesDirectoryPath,
    currentDirectoryPath = this.pagesDirectoryPath,
    routes: MultilingualRoute[] = []
  ): MultilingualRoute[] {
    if (!this.directoryContainsPages(currentDirectoryPath)) {
      throw new Error(`directories without pages are not supported: ${currentDirectoryPath}`);
    }

    readdirSync(currentDirectoryPath, { withFileTypes: true }).forEach((directoryEntry) => {
      const directoryEntryPath = resolve(currentDirectoryPath, directoryEntry.name);
      if (directoryEntry.isFile()) {
        // Create new routes for matching files.
        const directoryEntryExtension = extname(directoryEntryPath);

        if (!this.pagesExtensions.includes(directoryEntryExtension)) {
          return; // Skip this file if the extension is not in scope.
        }

        const pageFile = parsePath(directoryEntryPath);
        const pagePathWithoutExtension = resolve(pageFile.dir, pageFile.name);

        if (this.excludedPages.includes(pagePathWithoutExtension)) {
          return; // Skip this file if it's excluded.
        }

        const identifier = fileSystemPathToUrlPath(
          (pageFile.name === 'index' ? pageFile.dir : pagePathWithoutExtension).replace(
            baseDirectoryPath,
            ''
          )
        );

        if (identifier === '') {
          return; // Skip routes for the homepage since it uses '/'.
        }

        if (routes.find((route) => route.identifier === identifier) !== undefined) {
          // Instead of silently ignoring duplicate pages (current Next.js behavior), we will throw an error.
          throw new Error(
            `duplicate pages found between ${identifier} and ${identifier}/index. Please remove/rename one of the two.`
          );
        }

        const route = new MultilingualRoute(identifier);

        const parentIdentifier = identifier.includes('/')
          ? identifier.split('/').slice(0, -1).join('/')
          : undefined;

        const parentRoute =
          parentIdentifier !== undefined
            ? routes.find((route) => route.identifier === parentIdentifier)
            : undefined;

        this.actualLocales.forEach((locale) => {
          const urlSegment = this.getLocalizedUrlPathSegment(directoryEntryPath, locale);
          const urlPath =
            (parentRoute !== undefined
              ? parentRoute.localizedUrlPaths.find(
                  (localizedUrlPath) => localizedUrlPath.locale === locale
                ).urlPath
              : '') +
            '/' +
            urlSegment;

          route.localizedUrlPaths.push({
            locale,
            urlPath,
          });
        });

        routes.push(route);
      } else if (directoryEntry.isDirectory()) {
        // If the entry is a directory, call recursively to build child routes.
        this.getRoutes(baseDirectoryPath, directoryEntryPath, routes);
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
    const { dir: directoryPath, name: filename } = parsePath(filePath);
    const propertiesFilePath = resolve(directoryPath, `${filename}.${locale}.properties`);
    const parsedPropertiesFile = parsePropertiesFile(propertiesFilePath);
    const pageTitleKey = Object.keys(parsedPropertiesFile).find((key) =>
      key.endsWith('.pageTitle')
    );
    if (!pageTitleKey) {
      throw new Error(
        `next-multilingual requires page's .properties file to include a key ending with \`.pageTitle\``
      );
    }
    return parsedPropertiesFile[pageTitleKey].replace(/[ /-]+/g, '-').toLocaleLowerCase();
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
    const normalizedUrlPath = `/${locale}${urlPath}`.toLocaleLowerCase(locale);

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
 * @param applicationIdentifier - The unique application identifier that will be used as a messages key prefix. Must be between 3 to 50 alphanumerical characters.
 * @param locales - The actual desired locales of the multilingual application. The first locale will be the default locale. Only BCP 47 language tags following the `language`-`country` format are accepted.
 * @param options - Next.js configuration options.
 * @param pagesDirectoryPath - Specify where yor `pages` directory is, when not using the Next.js default location.
 * @param pagesExtensions - Specify the file extensions used by your pages if different than `.tsx` and `.jsx`.
 * @param excludedPages - Specify pages to excluded if different than the ones used by Next.js (e.g. _app.tsx).
 *
 * @return The Next.js configuration.
 *
 * @throws Error when the locale identifier or config is invalid or if there are conflicting options. For advanced
 * configuration, please use the `MulConfig`.
 */
export function getMulConfig(
  applicationIdentifier: string,
  locales: string[],
  options: NextConfig | ((phase: string, defaultConfig: NextConfig) => void),
  pagesDirectoryPath?: string,
  pagesExtensions?: string[],
  excludedPages?: string[]
): NextConfig {
  if (options instanceof Function) {
    throw new Error('Function config is not supported. Please use the `MulConfig` object instead');
  }

  ['env', 'i18n', 'webpack', 'rewrites', 'redirects'].forEach((option) => {
    if (options[option] !== undefined) {
      throw new Error(
        `the \`${option}\` option is not supported by \`getMulConfig\`. Please use the \`MulConfig\` object instead`
      );
    }
  });

  const config: NextConfig = options ? options : {};
  const mulConfig = new MulConfig(
    applicationIdentifier,
    locales,
    pagesDirectoryPath,
    pagesExtensions,
    excludedPages
  );

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
