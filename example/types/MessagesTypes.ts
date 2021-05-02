export type Messages = {
  [key: string]: string;
};

export type StaticMessagesProps = {
  messages: Messages;
};

export type ServerSideMessagesProps = {
  messages: Messages;
  currentLocale: string;
};
