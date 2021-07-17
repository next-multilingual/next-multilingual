import { useRouter } from 'next/router';

/**
 * Multilingual messages consist consist of unique keys and their localized strings.
 */
export type MulMessages = {
  readonly [key: string]: string;
};

/**
 * Multilingual messages for all locales, where the base keys are locale identifiers.
 */
export type MulMessagesAllLocales = {
  [key: string]: MulMessages;
};

export function useMessages(): MulMessages;
export function useMessages(mulMessagesAllLocales?: MulMessagesAllLocales): MulMessages {
  const { locale } = useRouter();
  if (!mulMessagesAllLocales)
    throw new Error("useMessages() requires the 'next-multilingual/babel-plugin' Babel plugin");
  return mulMessagesAllLocales[locale] || {};
}
