import { getRoutes } from './get-routes';
import type { Rewrite, Redirect } from 'next/dist/lib/load-custom-routes';

const escapeId = (src: string): string => encodeURIComponent(src).replace(/%2F/g, '/');

export default class IntlRouter {
  /** The base directory used to browse localisable assets. */
  private directory: string;
  /** The file extensions of the (page) files. */
  private extensions: string[] = ['.tsx'];
  /** The locales. */
  private locales: string[];
  /** By the default, the URLs are lowercase. */
  private useCasesInUrls = false;

  /** Cache of routes. */
  private _routes?: Record<string, string>[];

  /**
   * Constructor
   *
   * @param directory The base directory used to browser localizable assets.
   * @param extensions The file extensions of the (page) files.
   * @param locales The locales.
   * @param useCasesInUrls Set this to `true` if you want to use cases in your URLs (by default its lowercase).
   */
  constructor(
    directory: string,
    locales: string[],
    extensions?: string[],
    useCasesInUrls?: boolean
  ) {
    this.directory = directory;
    this.locales = locales.slice();
    this.useCasesInUrls = !!useCasesInUrls;

    if (extensions?.length) {
      this.extensions = extensions.map((ext) => (ext.startsWith('.') ? ext : `.${ext}`));
    }
  }

  /**
   * Get routes.
   */
  private async getRoutes(): Promise<Record<string, string>[]> {
    if (!this._routes) {
      this._routes = await getRoutes(this.directory, this.extensions, this.locales);
    }
    return this._routes;
  }

  /**
   * Normalize a URL path.
   *
   * @param locale The locale.
   * @param path The URL path.
   */
  private normalisePath(locale: string, path: string): string {
    const part = this.useCasesInUrls ? path : path.toLocaleLowerCase(locale);
    return `/${locale}/${part}`;
  }

  /**
   * Get Next.js rewrites directives.
   */
  public async getRewrites(): Promise<Rewrite[]> {
    const rewrites = [];
    for (const route of await this.getRoutes()) {
      for (const locale of this.locales) {
        // Normalize to NFC as per https://tools.ietf.org/html/rfc3987#section-3.1
        const source = escapeId(this.normalisePath(locale, route[locale]));
        const destination = this.normalisePath(locale, route._);

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
   */
  public async getRedirects(): Promise<Redirect[]> {
    const redirects = [];
    for (const route of await this.getRoutes()) {
      for (const locale of this.locales) {
        const source = this.normalisePath(locale, route[locale]);
        const canonical = source.normalize('NFC');
        const done = [canonical];
        for (const alternative of [
          source, // UTF-8
          source.normalize('NFD'),
          source.normalize('NFKC'),
          source.normalize('NFKD'),
          source.normalize('NFKD').replace(/[^\x21-\x7e]/g, ''), // é → e
          this.normalisePath(locale, route._).normalize('NFC'),
        ]) {
          if (!done.includes(alternative) && canonical !== alternative) {
            redirects.push({
              source: escapeId(alternative),
              destination: escapeId(canonical),
              locale: false,
              permanent: true,
            });
            done.push(alternative);
          }
        }
      }
    }
    return redirects;
  }
}
