import { useMessages, getTitle } from 'next-multilingual/messages';
import type { ReactElement } from 'react';
import Layout from '@/layout';
import styles from './[id].module.css';
import { useRouter } from 'next/router';

export default function Id(): ReactElement {
  const messages = useMessages();
  const title = getTitle(messages);
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout title={title}>
      <h1 className={styles.headline}>{title}</h1>
      <p>{messages.format('details')}</p>
      <p id="dynamic-value">{id}</p>
    </Layout>
  );
}
