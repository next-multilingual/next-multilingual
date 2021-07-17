import { readFileSync } from 'fs';
import { parse as parseProperties } from 'dot-properties';
import { MulMessages } from '.';

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
