import { useMessages } from 'next-multilingual/messages';
import { MulLink } from 'next-multilingual/link';
import type { ReactElement } from 'react';
import Layout from '@/layout';

export default function Custom400(): ReactElement {
  const messages = useMessages();
  return (
    <Layout title={messages.format('pageTitle')}>
      <h1>{messages.format('pageTitle')}</h1>
      <MulLink href="/">
        <a>{messages.format('goBack')}</a>
      </MulLink>
    </Layout>
  );
}
