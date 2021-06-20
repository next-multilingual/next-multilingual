import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { getActualLocale, normalizeLocale } from 'next-multilingual';
import { MulMessages } from 'next-multilingual/messages';
import styles from './Footer.module.css';

const Footer = (): ReactElement => {
  const { locale, locales, defaultLocale } = useRouter();
  const actualLocale = getActualLocale(locale, defaultLocale, locales);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const messages = require(`./Footer.${normalizeLocale(
    actualLocale
  )}.properties`).default as MulMessages;

  return <footer className={styles.footer}>{messages.footer}</footer>;
};

export default Footer;
