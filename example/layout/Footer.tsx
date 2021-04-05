import { useRouter } from 'next/router';
import { ReactElement, useState } from 'react';
import styles from './Footer.module.css';

type Messages = {
  [key: string]: string;
};

const Footer = (): ReactElement => {
  const { locale } = useRouter();
  const [messages, setMessages] = useState<Messages | undefined>();
  const messagesLoader = (): Promise<Messages> =>
    import(`./footer.${locale}.properties`).then((res) => res.default);
  messagesLoader().then((messages) => setMessages(messages));
  return messages ? (
    <div className={styles.footerContainer}>{messages.footer}</div>
  ) : null;
};

export default Footer;
