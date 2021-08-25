import { useRouter } from 'next/router';
import { BabelifiedMessages } from './babel-plugin';
import { parse as parsePath, resolve } from 'path';
import { normalizeLocale } from '..';
import { log } from '..';

/** This is the regular expression to validate message key segments. */
export const keySegmentRegExp = /^[a-z\d]{3,50}$/i;
/** This is the key identifier used to localize URL segments. */
export const urlSegmentKeyId = 'pageTitle';

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
 * Multilingual messages consist of unique keys and their localized strings.
 */
export type MulMessages = {
  readonly [key: string]: string;
};

/**
 * Multilingual messages collection for all locales.
 */
export type MulMessagesCollection = {
  [key: string]: MulMessages;
};

/**
 * The values (e.g. placeholders) used to format a message.
 */
export type MessageValues = {
  readonly [key: string]: string | number;
};

/**
 * Object used to format localized messages of a local scope.
 */
export class Messages {
  /** Localized messages of a local scope. */
  private messages: MulMessages;
  /** The source (the file calling `useMessages`) file path. */
  private sourceFilePath: string;
  /** The messages file path. */
  private messagesFilePath: string;

  /**
   * Create an object used to format localized messages of a local scope.
   *
   * @param messages - The messages usable in the local scope.
   * @param sourceFilePath - The file path of the source file associated with the messages.
   * @param messagesFilePath - The file path
   */
  constructor(messages: MulMessages, sourceFilePath: string, messagesFilePath: string) {
    this.messages = messages;
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
    if (this.messages === undefined) {
      // No need to log the error since it was caught when calling `useMessage()`.
      return '';
    }

    if (values) {
      // todo: implement value
    }
    if (Object.keys(this.messages).length && this.messages[key] === undefined) {
      log.warn(
        `unable to format key with identifier \`${key}\` in \`${this.sourceFilePath}\` because it was not found in messages file \`${this.messagesFilePath}\``
      );
    }

    return this.messages[key];
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

  if (!babelifiedMessages.messagesCollection[locale]) {
    log.warn(
      `unable to use \`useMessages()\` in \`${babelifiedMessages.sourceFilePath}\` because the messages file was not found at \`${messagesFilePath}\``
    );
  }

  return new Messages(
    babelifiedMessages.messagesCollection[locale],
    sourceFilePath,
    messagesFilePath
  );
}
