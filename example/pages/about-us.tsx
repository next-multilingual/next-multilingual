import { useMessages } from 'next-multilingual/messages';
import type { ReactElement } from 'react';
import Layout from '@/layout';
import styles from './index.module.css';

export default function AboutUs(): ReactElement {
  const messages = useMessages();
  return (
    <Layout title={messages.format('pageTitle')}>
      <h1 className={styles.headline}>{messages.format('pageTitle')}</h1>
      <p>{messages.format('details')}</p>
    </Layout>
  );
}
