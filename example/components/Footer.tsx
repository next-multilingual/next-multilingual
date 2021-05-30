/* eslint @typescript-eslint/no-var-requires: "off" */
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { normalizeLocale } from 'next-multilingual';
import styles from './Footer.module.css';

const Footer = (): ReactElement => {
  const { locale } = useRouter();
  const messages = require(`./Footer.${normalizeLocale(locale)}.properties`)
    .default;

  return <footer className={styles.footer}>{messages.footer}</footer>;
};

export default Footer;
