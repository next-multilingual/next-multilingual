import { parse as parseProperties } from 'dot-properties';
import { readFile } from 'fs/promises';
import { basename, parse as parsePath, resolve } from 'path';

export async function getPageId(
  pagePath: string,
  locale: string,
  atRoot: boolean
) {
  const { dir, name } = parsePath(pagePath);
  const propPath = resolve(dir, `${name}.${locale}.properties`);
  let title: any;
  try {
    const propSrc = await readFile(propPath, 'utf8');
    title = parseProperties(propSrc).title;
  } catch (error) {
    if (error.code !== 'ENOENT') console.log(error);
    title = '';
  }
  if (!title || typeof title !== 'string')
    return name && (atRoot || name !== 'index') ? name : basename(dir);
  return title.replace(/[ \/-]+/g, '-');
}
