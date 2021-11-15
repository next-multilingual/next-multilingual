import { useRouter } from 'next/router';
import { BabelifiedMessages } from './babel-plugin';
import { extname, parse as parsePath, resolve } from 'path';
import { normalizeLocale } from '..';
import { log } from '..';
import { KeyValueObject } from './properties';
import IntlMessageFormat from 'intl-messageformat';

/** This is the regular expression to validate message key segments. */
export const keySegmentRegExp = /^[a-z\d]{1,50}$/i;
/** This is the regular expression description to keep logs consistent. */
export const keySegmentRegExpDescription = 'must be between 1 and 50 alphanumerical characters';

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
 * @param values - The values (e.g. placeholders) used to format the message, if any.
 *
 * @returns The message message as a string.
 */
export function getTitle(messages: Messages, values?: MessageValues): string {
  const titleMessage = messages.format(TITLE_KEY_ID, values, true);
  const slugMessage = messages.format(SLUG_KEY_ID, values, true);

  const applicableTitle = titleMessage !== '' ? titleMessage : slugMessage;

  if (applicableTitle === '') {
    log.warn(
      `unable to use \`getTitle\` in \`${messages.sourceFilePath}\` because keys with identifiers \`${TITLE_KEY_ID}\` and \`${SLUG_KEY_ID}\` were not found in messages file \`${messages.messagesFilePath}\``
    );
  }

  return applicableTitle;
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
 * The values (e.g. placeholders) used to format a message.
 */
export type MessageValues = {
  readonly [key: string]: string | number;
};

/**
 * An index to optimize `get` access on messages.
 */
export type MessagesIndex = {
  [key: string]: number;
};

/**
 * Object used to format individual localized messages of a local scope.
 */
export class Message {
  /** The parent messages object. */
  private parent: Messages;
  /** The message key. */
  readonly key: string;
  /** The localized message. */
  private message: string;
  /** The IntlMessageFormat objet, if required. */
  private intlMessageFormat: IntlMessageFormat;

  /**
   * Create an object used to format localized messages of a local scope.
   *
   * @param parent - The parent messages object.
   * @param key - The key of the message.
   * @param message - The localized message.
   */
  constructor(parent: Messages, key: string, message: string) {
    this.parent = parent;
    this.key = key;
    this.message = message;
  }

  /**
   * Format a message identified by a key in a local scope.
   *
   * @param key - The local scope key identifying the message.
   * @param values - The values (e.g. placeholders) used to format the message, if any.
   *
   * @returns The formatted message as a string.
   */
  public format(values?: MessageValues): string {
    if (values) {
      this.intlMessageFormat = this.intlMessageFormat
        ? this.intlMessageFormat
        : new IntlMessageFormat(this.message, this.parent.locale);

      return String(this.intlMessageFormat.format(values));
    }

    return this.message;
  }
}

/**
 * Object used to format localized messages of a local scope.
 */
export class Messages {
  /** Localized messages of a local scope. */
  private messages: Message[] = [];
  /** An index to optimize `get` access on messages. */
  private messagesIndex: MessagesIndex = {};
  /** The current locale from Next.js. */
  readonly locale: string;
  /** The source (the file calling `useMessages`) file path. */
  readonly sourceFilePath: string;
  /** The messages file path. */
  readonly messagesFilePath: string;

  /**
   * Create an object used to format localized messages of a local scope.
   *
   * @param keyValueObject - The "key/value" object coming directly from a `.properties` file.
   * @param locale - The current locale from Next.js.
   * @param sourceFilePath - The file path of the source file associated with the messages.
   * @param messagesFilePath - The file path of the messages.
   */
  constructor(
    keyValueObject: KeyValueObject,
    locale: string,
    sourceFilePath: string,
    messagesFilePath: string
  ) {
    if (keyValueObject) {
      Object.keys(keyValueObject).forEach((key) => {
        this.messagesIndex[key] =
          this.messages.push(new Message(this, key, keyValueObject[key])) - 1;
      });
    }
    this.locale = normalizeLocale(locale);
    this.sourceFilePath = sourceFilePath;
    this.messagesFilePath = messagesFilePath;
  }

  /**
   * Format a message identified by a key in a local scope.
   *
   * @param key - The local scope key identifying the message.
   * @param values - The values (e.g. placeholders) used to format the message, if any.
   * @param suppressWarning - If set to true, will not display a warning message if the key is missing.
   *
   * @returns The formatted message as a string.
   */
  public format(key: string, values?: MessageValues, suppressWarning = false): string {
    if (!this.messages.length) {
      // No need to log the error since it was caught when calling `useMessage()`.
      return '';
    }

    const message = this.messages[this.messagesIndex[key]];

    if (message === undefined) {
      if (!suppressWarning) {
        log.warn(
          `unable to format key with identifier \`${key}\` in \`${this.sourceFilePath}\` because it was not found in messages file \`${this.messagesFilePath}\``
        );
      }
      return '';
    }

    return message.format(values);
  }

  /**
   * Get all messages contained in a given local scope.
   *
   * @returns All messages contained in a given local scope.
   */
  public getAll(): Message[] {
    return this.messages;
  }
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
  const parsedSourceFile = parsePath(sourceFilePath);
  const sourceFileDirectoryPath = parsedSourceFile.dir;
  const messagesFilename = `${parsedSourceFile.name}.${normalizeLocale(locale)}.properties`;
  const messagesFilePath = resolve(sourceFileDirectoryPath, messagesFilename);

  if (!babelifiedMessages.keyValueObjectCollection[locale]) {
    log.warn(
      `unable to use \`${caller}()\` in \`${babelifiedMessages.sourceFilePath}\` because no message file could be found at \`${messagesFilePath}\``
    );
  }

  return new Messages(
    babelifiedMessages.keyValueObjectCollection[locale],
    locale.toLowerCase(),
    sourceFilePath,
    messagesFilePath
  );
}
