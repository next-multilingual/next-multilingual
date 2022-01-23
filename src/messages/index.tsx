import { useRouter } from 'next/router';
import { extname, parse as parsePath, resolve } from 'path';

import { highlight, highlightFilePath, log, normalizeLocale } from '../';
import { BabelifiedMessages } from './babel-plugin';
import { Messages } from './Messages';

/** This is the regular expression to validate message key segments. */
export const keySegmentRegExp = /^[a-z\d]{1,50}$/i;
/** This is the regular expression description to keep logs consistent. */
export const keySegmentRegExpDescription = 'must be between 1 and 50 alphanumeric characters';

/**
 * The message key identifier used for slugs.
 */
export const SLUG_KEY_ID = 'slug';

/**
 * The message key identifier used for titles.
 */
export const TITLE_KEY_ID = 'title';

/**
 * Get a page's title from the locale scope messages.
 *
 * A page's `slug` (human readable short description) can meet most use cases for title but
 * sometimes you might want to customize it. This helper API will check if the `title` message
 * is available first, and if not try to fallback on the `slug`.
 *
 * @param messages - The object containing localized messages of a local scope.
 * @param values - The values of the title's placeholders (e.g., `{name: 'Joe'}`), if any.
 *
 * @returns The message message as a string.
 */
export function getTitle(messages: Messages, values?: PlaceholderValues): string {
  const titleMessage = messages.get(TITLE_KEY_ID);
  const slugMessage = messages.get(SLUG_KEY_ID);

  const applicableTitle = titleMessage !== undefined ? titleMessage : slugMessage;

  if (applicableTitle === undefined) {
    log.warn(
      `unable to use ${highlight('getTitle')} in ${highlightFilePath(
        messages.sourceFilePath
      )} because keys with identifiers ${highlight(TITLE_KEY_ID)} and ${highlight(
        SLUG_KEY_ID
      )} were not found in messages file ${highlightFilePath(messages.messagesFilePath)}`
    );
    return '';
  }

  return applicableTitle.format(values);
}

/**
 * Get a localized messages file path associated with a Next.js page.
 *
 * @param filesystemPath - The filesystem path (file or directory).
 * @param locale - The locale of the message file.
 *
 * @returns A localized messages file path.
 */
export function getMessagesFilePath(filesystemPath: string, locale: string): string {
  const pageFileExtension = extname(filesystemPath);

  if (pageFileExtension) {
    // Filesystem path is a file.
    return `${filesystemPath.replace(pageFileExtension, '')}.${normalizeLocale(locale)}.properties`;
  }

  // Filesystem path is a directory.
  return `${filesystemPath}/index.${normalizeLocale(locale)}.properties`;
}

/**
 * Get the path of the source file that is calling `useMessages()`.
 *
 * @param messageFilePath - The file path of one of the messages files (any locale).
 * @param sourceFileExtension  - The extension of the source file.
 *
 * @returns The path of the source file that is calling `useMessages()`.
 */
export function getSourceFilePath(messageFilePath: string, sourceFileExtension: string): string {
  const messagesFile = parsePath(messageFilePath);
  const sourceFilename = messagesFile.name.split('.').slice(0, -1).join('.');
  return resolve(messagesFile.dir, `${sourceFilename}${sourceFileExtension}`);
}

/**
 * The value of a message's placeholder (e.g., `{name}`).
 */
export type PlaceholderValue = string | number;

/**
 * The values of a message's placeholders (e.g., `{name: 'Joe'}`).
 */
export type PlaceholderValues = {
  [key: string]: string | number;
};

/**
 * The value of a message's JSX element (e.g., `<b></b>`).
 */
export type JsxValue = JSX.Element;

/**
 * The values of a message's JSX elements (e.g., `{b: <b></b>}`).
 */
export type JsxValues = {
  [key: string]: JsxValue;
};

/**
 * Any (mixed) message value (placeholders and/or JSX).
 */
export type MixedValue = PlaceholderValue | JsxValue;

/**
 * The (mixed) values of a message (placeholder and/or JSX).
 */
export type MixedValues = {
  [key: string]: MixedValue;
};

/**
 * Message values by types.
 */
export type MessageValuesByType = {
  placeholderValues: PlaceholderValues;
  jsxValues: JsxValues;
};

/**
 * An index to optimize `get` access on messages.
 */
export type MessagesIndex = {
  [key: string]: number;
};

/**
 * Type guard to check if a message value is a JSX element.
 *
 * @param values - The value of a message (placeholder and/or JSX).
 *
 * @returns True is the value is a JSX element, otherwise false.
 */
export function isJsxValue(value: MixedValue): value is JsxValue {
  return !isPlaceholderValue(value);
}

/**
 * Type guard to check if a message value is a placeholder.
 *
 * @param values - The value of a message (placeholder and/or JSX).
 *
 * @returns True is the value is a placeholder, otherwise false.
 */
export function isPlaceholderValue(value: MixedValue): value is PlaceholderValue {
  return ['string', 'number'].includes(typeof value);
}

/**
 * React hook to get the localized messages specific to a Next.js context.
 *
 * @returns An object containing the messages of the local scope.
 */
export function useMessages(): Messages {
  const { locale } = useRouter();
  return handleMessages(this, 'useMessages', locale);
}

/**
 * Get the localized messages specific to a Next.js context.
 *
 * @param locale - The locale of the message file.
 *
 * @returns An object containing the messages of the local scope.
 */
export function getMessages(locale: string): Messages {
  return handleMessages(this, 'getMessages', locale.toLowerCase());
}

/**
 * Handles messages coming from both `useMessages` and `getMessages`.
 *
 * @param babelifiedMessages - The "babelified" messages object.
 * @param caller - The function calling the message handler.
 * @param locale - The locale of the message file.
 *
 * @returns An object containing the messages of the local scope.
 */
export function handleMessages(
  babelifiedMessages: BabelifiedMessages,
  caller: string,
  locale: string
): Messages {
  if (!babelifiedMessages || !babelifiedMessages.babelified) {
    throw new Error(
      `${caller}() requires the 'next-multilingual/messages/babel-plugin' Babel plugin`
    );
  }

  const sourceFilePath = babelifiedMessages.sourceFilePath;
  const sourceBasename = sourceFilePath.split('/').pop();
  const sourceFilename = sourceBasename.split('.').slice(0, -1).join('.');
  const sourceFileDirectoryPath = sourceFilePath.split('/').slice(0, -1).join('/');
  const messagesFilename = `${sourceFilename}.${normalizeLocale(locale)}.properties`;
  const messagesFilePath = sourceFileDirectoryPath.length
    ? `${sourceFileDirectoryPath}/${messagesFilename}`
    : messagesFilename;

  if (!babelifiedMessages.keyValueObjectCollection[locale]) {
    log.warn(
      `unable to use ${highlight(caller)}() in ${highlightFilePath(
        babelifiedMessages.sourceFilePath
      )} because no message file could be found at ${highlightFilePath(messagesFilePath)}`
    );
  }

  return new Messages(
    babelifiedMessages.keyValueObjectCollection[locale],
    locale.toLowerCase(),
    sourceFilePath,
    messagesFilePath
  );
}
