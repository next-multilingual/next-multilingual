import { useRouter } from 'next/router';

/**
 * Multilingual messages consist consist of unique keys and their localized strings.
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

export function useMessages(): MulMessages;
export function useMessages(mulMessagesCollection?: MulMessagesCollection): MulMessages {
  const { locale } = useRouter();
  if (!mulMessagesCollection)
    throw new Error(
      "useMessages() requires the 'next-multilingual/messages/babel-plugin' Babel plugin"
    );
  return mulMessagesCollection[locale] || {};
}
