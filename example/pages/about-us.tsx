import { useMessages } from 'next-multilingual/messages';
import type { ReactElement } from 'react';
import Layout from '@/layout';
import styles from './index.module.css';
import { useFruitsMessages } from '../messages/Fruits';

export default function AboutUs(): ReactElement {
  const messages = useMessages();
  const fruitsMessages = useFruitsMessages();
  return (
    <Layout title={messages.format('pageTitle')}>
      <h1 className={styles.headline}>{messages.format('pageTitle')}</h1>
      <p>{messages.format('details')}</p>
      <p>
        {fruitsMessages
          .getAll()
          .map((message) => message.format())
          .join(', ')}
      </p>
    </Layout>
  );
}
