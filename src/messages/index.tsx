/**
 * Multilingual messages consist consist of unique keys and their localized strings.
 */
export type MulMessages = {
  [key: string]: string;
};

/**
 * Generic properties for multilingual messages when using `getStaticProps`.
 */
export type MulMessagesStaticProps = {
  messages: MulMessages;
};

/**
 * Generic properties for multilingual messages when using `getServerSideProps`.
 *
 * Typically `getServerSideProps` is only used on `/` for locale detection, otherwise `getStaticProps` is recommended.
 */
export type MulMessagesServerSideProps = {
  messages: MulMessages;
  actualLocale: string;
};
