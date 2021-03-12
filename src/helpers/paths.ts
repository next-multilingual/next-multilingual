export const removeFirstSlash = (path: string) => path.startsWith('/') ? path.substr(1, path.length) : path
