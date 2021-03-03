export const getBasePath = (basePath?: string): string =>
  basePath ? basePath.replace('/', '') + '/' : '';
