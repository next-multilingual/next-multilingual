import { ReactElement } from 'react';
import { useMessages } from 'next-multilingual/messages';
import Layout from '@/layout';

export default function MessageSent(): ReactElement {
  const messages = useMessages();

  return (
    <Layout title={messages.format('pageTitle')}>
      <h1>{messages.format('header')}</h1>
    </Layout>
  );
}
