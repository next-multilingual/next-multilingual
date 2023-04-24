import { readFileSync } from 'node:fs'
import { getProperties } from 'properties-file'
import { highlight, highlightFilePath, log } from '../'

/**
 * A simple "key/value" object used to store messages.
 */
export type KeyValueObject = {
  [key: string]: string
}

/**
 * A collection of "key/value" objects for for all locales.
 */
export type KeyValueObjectCollection = {
  [key: string]: KeyValueObject
}

/**
 * Parse a `.properties` file and return it back as a "key/value" object.
 *
 * @param filePath - The file path of the `.properties` file to parse.
 *
 * @returns The "raw" representation of a `.properties` fille in a simple "key/value" object.
 */
export const parsePropertiesFile = (filePath: string): KeyValueObject => {
  const fileContent = stripBom(readFileSync(filePath, 'utf8'))

  if (fileContent.includes('�')) {
    log.warn(
      `found a garbled character ${highlight('�')} in ${highlightFilePath(
        filePath
      )} which most likely points to an encoding issue. Please make sure that your file's encoding is UTF-8 compatible.`
    )
  }

  return getProperties(fileContent)
}

/**
 * Strip BOM character if present, since it is not supported by .properties file readers.
 *
 * @param fileContent - The content from a file.
 *
 * @returns The content from a file, without the BOM character.
 */
export const stripBom = (fileContent: string): string =>
  fileContent.codePointAt(0) === 0xfeff ? fileContent.slice(1) : fileContent
