import { NextPage } from 'next';
import Link from 'next-multilingual/link';
import { getTitle, useMessages } from 'next-multilingual/messages';

import Layout from '@/layout';

const Custom400: NextPage = () => {
  const messages = useMessages();
  const title = getTitle(messages);
  return (
    <Layout title={title}>
      <h1>{title}</h1>
      <Link href="/">
        <a>{messages.format('goBack')}</a>
      </Link>
    </Layout>
  );
};

export default Custom400;
