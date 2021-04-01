import { readdir } from 'fs/promises';
import { basename, extname, posix, resolve } from 'path';
import { getPageId } from './get-page-id';

export type Route = Record<string, string>;

/**
 * Returns the routes of the files from a specific directory
 * @param {string} directory  - The directory to react the files from
 * @param {string[]} extensions - Extensions of the files within the directory
 * @param {string[]} locales - The locales defined in next.config.js file
 * @param {boolean?} atRoot - Whether or not its the root file
 * @return {Route[]} The routes
 */
export async function getRoutes(
  directory: string,
  extensions: string[],
  locales: string[],
  atRoot = true
): Promise<Route[]> {
  const routes: Route[] = [];
  for (const path of await readdir(directory, { withFileTypes: true })) {
    const completePath = resolve(directory, path.name);
    if (path.isDirectory()) {
      const pathRoutes = await getRoutes(completePath, extensions, locales, false);
      const indexRoute = pathRoutes.find((route) => route._ === 'index');
      for (const route of pathRoutes) {
        if (route === indexRoute) {
          route._ = path.name;
        } else {
          for (const [locale, id] of Object.entries(route)) {
            const routeDirectory = indexRoute?.[locale] || path.name;
            route[locale] = posix.join(routeDirectory, id);
          }
        }
        routes.push(route);
      }
    } else {
      const extension = extname(path.name);

      if (extensions.includes(extension)) {
        const id = basename(path.name, extension);
        const route: Route = { _: id };
        let hasRoute = false;
        for (const locale of locales) {
          const localId = await getPageId(completePath, locale, atRoot);
          if (localId !== id) {
            route[locale] = localId;
            hasRoute = true;
          }
        }
        if (hasRoute) routes.push(route);
      }
    }
  }
  return routes;
}
