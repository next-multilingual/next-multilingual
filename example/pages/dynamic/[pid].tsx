import type { ReactElement } from 'react';
import Layout from '@/layout';
import { useMessages, getTitle } from 'next-multilingual/messages';
import { useRouter } from 'next/router';

export default function Pid(): ReactElement {
  const router = useRouter();
  const { pid } = router.query;
  const messages = useMessages();
  const title = getTitle(messages);

  return (
    <Layout title={title}>
      <h1>{title}</h1>
      <h2>{pid}</h2>
    </Layout>
  );
}
