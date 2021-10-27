import { useMessages, getTitle } from 'next-multilingual/messages';
import { MulLink } from 'next-multilingual/link';
import type { ReactElement } from 'react';
import Layout from '@/layout';

export default function Custom400(): ReactElement {
  const messages = useMessages();
  const title = getTitle(messages);
  return (
    <Layout title={title}>
      <h1>{title}</h1>
      <MulLink href="/">
        <a>{messages.format('goBack')}</a>
      </MulLink>
    </Layout>
  );
}
