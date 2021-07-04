/**
 * Multilingual messages consist consist of unique keys and their localized strings.
 */
export type MulMessages = {
  readonly [key: string]: string;
};

/**
 * Generic properties for multilingual messages when using `getStaticProps`.
 */
export type MulMessagesStaticProps = {
  /** A list of strings (messages) identified by unique keys. */
  readonly messages: MulMessages;
};

/**
 * Generic properties for multilingual messages when using `getServerSideProps`.
 *
 * Typically `getServerSideProps` is only used on `/` for locale detection, otherwise `getStaticProps` is recommended.
 */
export type MulMessagesServerSideProps = {
  /** A list of strings (messages) identified by unique keys. */
  readonly messages: MulMessages;
  /** The locale resolved by the server side detection (typically only used on the homepage). */
  readonly resolvedLocale: string;
};
