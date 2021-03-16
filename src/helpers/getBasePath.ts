/**
 * If we have a basePath we remove the initial slash and add it at the end and return it
 * @param basePath { string? } - the basePath
 */
export function getBasePath(basePath?: string): string {
  return basePath ? basePath.replace('/', '') + '/' : '';
}
