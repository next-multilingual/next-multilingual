import { useMessages } from 'next-multilingual/messages';
import type { ReactElement } from 'react';
import Layout from '@/layout';

export default function AboutUs(): ReactElement {
  const messages = useMessages();
  return (
    <Layout title={messages.title}>
      <h1>{messages.title}</h1>
      <p>{messages.details}</p>
    </Layout>
  );
}
