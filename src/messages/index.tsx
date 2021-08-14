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

export type MessageValues = {
  readonly [key: string]: string | number;
};

export class Messages {
  private messages: MulMessages = {};

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

  // public format(key: string, values: MessageValues): string {
  public format(key: string): string {
    return this.messages[key];
  }
}

/**
 * Hook to get the localized messages specific to a Next.js component or page.
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
