import { useRouter } from 'next/router';
import { BabelifiedMessages } from './babel-plugin';
import { parse as parsePath, resolve } from 'path';
import { normalizeLocale } from '..';
import { log } from '..';
import { KeyValueObject } from './properties';
import IntlMessageFormat from 'intl-messageformat';

/** This is the regular expression to validate message key segments. */
export const keySegmentRegExp = /^[a-z\d]{3,50}$/i;

/**
 * Get a page's title from the locale scope messages.
 *
 * A page's `slug` (human readable short description) can meet most use cases for title but
 * sometimes you might want to customize it. This helper API will check if the `title` message
 * is available first, and if not try to fallback on the `slug`.
 *
 * @param messages - The object containing localized messages of a local scope.
 *
 * @returns The message message as a string.
 */
export function getTitle(messages: Messages): Message {
  const titleMessage = messages.get('title');
  const slugMessage = messages.get('slug');
  return titleMessage ? titleMessage : slugMessage;
}

/**
 * Get the localized messages file path.
 *
 * @param sourceFilePath - The path of the source file that is calling `useMessages()`.
 * @param locale - The locale of the message file.
 * @returns
 */
export function getMessagesFilePath(sourceFilePath: string, locale: string): string {
  const { dir: directoryPath, name: filename } = parsePath(sourceFilePath);
  return resolve(directoryPath, `${filename}.${normalizeLocale(locale)}.properties`);
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
        this.messages.push(new Message(this, key, keyValueObject[key]));
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
   *
   * @returns The formatted message as a string.
   */
  public format(key: string, values?: MessageValues): string {
    if (!this.messages.length) {
      // No need to log the error since it was caught when calling `useMessage()`.
      return '';
    }

    const message = this.messages.find((message) => message.key === key);

    if (message === undefined) {
      log.warn(
        `unable to format key with identifier \`${key}\` in \`${this.sourceFilePath}\` because it was not found in messages file \`${this.messagesFilePath}\``
      );
      return '';
    }

    return message.format(values);
  }

  /**
   * Get a specific message contained in a given local scope.
   *
   * @returns The message with the given key, or `undefined` if not found.
   */
  public get(key: string): Message {
    return this.messages.find((message) => message.key === key);
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
 * Hook to get the localized messages specific to a Next.js context.
 *
 * @returns An object containing the messages of the local scope.
 */
export function useMessages(): Messages {
  if (!this || !(this as BabelifiedMessages).babelified) {
    throw new Error(
      "useMessages() requires the 'next-multilingual/messages/babel-plugin' Babel plugin"
    );
  }

  const { locale } = useRouter();

  const babelifiedMessages = this as BabelifiedMessages;
  const sourceFilePath = babelifiedMessages.sourceFilePath;
  const parsedSourceFile = parsePath(sourceFilePath);
  const sourceFileDirectoryPath = parsedSourceFile.dir;
  const messagesFilename = `${parsedSourceFile.name}.${normalizeLocale(locale)}.properties`;
  const messagesFilePath = resolve(sourceFileDirectoryPath, messagesFilename);

  if (!babelifiedMessages.keyValueObjectCollection[locale]) {
    log.warn(
      `unable to use \`useMessages()\` in \`${babelifiedMessages.sourceFilePath}\` because no message could be found at \`${messagesFilePath}\``
    );
  }

  return new Messages(
    babelifiedMessages.keyValueObjectCollection[locale],
    locale,
    sourceFilePath,
    messagesFilePath
  );
}
