import { parse as parseProperties } from 'dot-properties';
import { readFileSync } from 'fs';
import type { MulMessages } from '../messages';

/**
 * This is the default export, used by Webpack as the properties file loader.
 *
 * @param fileContent - The imported file's content passed by Webpack.
 *
 * @returns The JavaScript source code of the module (in string format) that will provide simple access to
 * the file's content as a "key/value" object.
 */
export default function propertiesWebpackLoader(fileContent: string): string {
  return `export default ${JSON.stringify(parseProperties(fileContent))}`;
}

/**
 * Parse a `.properties` file and return it back as a "key/value" object.
 *
 * @param filePath - The file path of the `.properties` file to parse.
 *
 * @returns A "key/value" object to easily access the `.properties` file's content.
 */
export function parsePropertiesFile(filePath: string): MulMessages {
  const fileContent = readFileSync(filePath, 'utf8');
  return parseProperties(fileContent) as MulMessages;
}
