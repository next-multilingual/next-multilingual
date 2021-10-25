import { useMessages, getTitle } from 'next-multilingual/messages';
import type { ReactElement } from 'react';
import Layout from '@/layout';
import styles from './index.module.css';

export default function AboutUs(): ReactElement {
  const messages = useMessages();
  const title = getTitle(messages).format();
  return (
    <Layout title={title}>
      <h1 className={styles.headline}>{title}</h1>
      <p>{messages.format('details')}</p>
    </Layout>
  );
}
