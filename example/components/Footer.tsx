import type { ReactElement } from 'react';
import { useMessages } from 'next-multilingual/messages';
import styles from './Footer.module.css';

export default function Footer(): ReactElement {
  const messages = useMessages();
  return <footer className={styles.footer}>{messages.footer}</footer>;
}
