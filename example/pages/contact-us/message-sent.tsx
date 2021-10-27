import { ReactElement } from 'react';
import { useMessages, getTitle } from 'next-multilingual/messages';
import Layout from '@/layout';

export default function MessageSent(): ReactElement {
  const messages = useMessages();

  return (
    <Layout title={getTitle(messages)}>
      <h1>{messages.format('header')}</h1>
    </Layout>
  );
}
