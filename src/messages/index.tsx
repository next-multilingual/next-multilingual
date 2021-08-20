import { useRouter } from 'next/router';
import { BabelifiedMessages } from './babel-plugin';
import { parse, resolve } from 'path';
import { normalizeLocale } from '..';

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
  private messages: MulMessages = {};

  /**
   * Create an object used to format localized messages of a local scope.
   *
   * @param babelifiedMessages - Localized messages created by the Babel plugin.
   * @param locale - The locale of the messages.
   */
  constructor(babelifiedMessages: BabelifiedMessages, locale: string) {
    if (!babelifiedMessages.messagesCollection[locale]) {
      const parsedSourceFile = parse(babelifiedMessages.sourceFilePath);
      const sourceFileDirectoryPath = parsedSourceFile.dir;
      const missingFilename = `${parsedSourceFile.name}.${normalizeLocale(locale)}.properties`;
      const missingFilePath = resolve(sourceFileDirectoryPath, missingFilename);
      throw new Error(`messages file not found at ${missingFilePath}`);
    }

    this.messages = babelifiedMessages.messagesCollection[locale];
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
    if (values) {
      // todo: implement value
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
  return new Messages(this as BabelifiedMessages, locale);
}
