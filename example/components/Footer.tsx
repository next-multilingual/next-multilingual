import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { normalizeLocale } from 'next-multilingual';
import { MulMessages } from 'next-multilingual/messages';
import styles from './Footer.module.css';

const Footer = (): ReactElement => {
  const { locale } = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const messages = require(`./Footer.${normalizeLocale(locale)}.properties`)
    .default as MulMessages;

  return <footer className={styles.footer}>{messages.footer}</footer>;
};

export default Footer;
