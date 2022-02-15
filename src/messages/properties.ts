import { parse as parseProperties } from 'dot-properties';
import yaml from 'js-yaml';
import { readFileSync } from 'fs';

import { highlight, highlightFilePath, log } from '../';

/**
 * A simple "key/value" object used to store messages.
 */
export type KeyValueObject = {
  readonly [key: string]: string;
};

/**
 * A collection of "key/value" objects for for all locales.
 */
export type KeyValueObjectCollection = {
  [key: string]: KeyValueObject;
};

/**
 * Parse a translation file and return it back as a "key/value" object.
 *
 * @param filePath - The file path of the `.properties|.json|.ya?ml` file to parse.
 *
 * @returns The "raw" representation of a translation file in a simple "key/value" object.
 */
export function parsePropertiesFile(filePath: string): KeyValueObject {
  const translationFileExt = process.env.nextMultilingualTranslationFileExt;
  const fileContent = stripBom(readFileSync(filePath, 'utf8'));

  if (fileContent.includes('�')) {
    log.warn(
      `found a garbled character ${highlight('�')} in ${highlightFilePath(
        filePath
      )} which most likely points to an encoding issue. Please make sure that your file's encoding is UTF-8 compatible.`
    );
  }

  if (translationFileExt === '.properties') {
    return parseProperties(fileContent) as KeyValueObject;
  } else if (translationFileExt === '.json') {
    return JSON.parse(fileContent) as KeyValueObject;
  } else if (['.yaml', '.yml'].includes(translationFileExt)) {
    return yaml.load(fileContent) as KeyValueObject;
  }

  log.warn(
    `unknown translation file extension ${translationFileExt} used.`
  );
  return {} as KeyValueObject;
}

/**
 * Strip BOM character if present, since it is not supported by .properties file readers.
 *
 * @param fileContent - The content from a file.
 *
 * @returns The content from a file, without the BOM character.
 */
export function stripBom(fileContent: string): string {
  return fileContent.charCodeAt(0) === 0xfeff ? fileContent.slice(1) : fileContent;
}
