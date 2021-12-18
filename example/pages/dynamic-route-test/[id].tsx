import { useMessages, getTitle } from 'next-multilingual/messages';
import type { ReactElement } from 'react';
import Layout from '@/layout';
import styles from './[id].module.css';
import { useRouter } from 'next/router';
import Link from 'next-multilingual/link';

export default function Id(): ReactElement {
  const messages = useMessages();
  const title = getTitle(messages);
  const {pathname, query } = useRouter();
  const { id } = query;
  const dynamicValue = Math.round(Math.random() * 1000);

  return (
    <Layout title={title}>
      <h1 className={styles.headline}>{title}</h1>
      <p>{messages.format('details')}</p>
      <p id="dynamic-value">{id}</p>
      <p>Pathname {pathname}</p>
      <Link href={{ pathname, query: {id: dynamicValue}}}>This is a test link</Link>
    </Layout>
  );
}
