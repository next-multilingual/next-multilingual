import { useRouter } from 'next/router';
import { BabelifiedMessages } from './babel-plugin';

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
 * Hook to get the localized messages specific to a Next.js component or page.
 */
export function useMessages(): MulMessages {
  if (!this || !(this as BabelifiedMessages).babelified) {
    throw new Error(
      "useMessages() requires the 'next-multilingual/messages/babel-plugin' Babel plugin"
    );
  }
  const { locale } = useRouter();
  return (this as BabelifiedMessages).messages[locale] || {};
}
