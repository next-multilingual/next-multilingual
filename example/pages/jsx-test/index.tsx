import { NextPage } from 'next';
import { getTitle, useMessages } from 'next-multilingual/messages';
import React from 'react';

import Layout from '@/layout';

import styles from './index.module.css';

const Tests: NextPage = () => {
  const messages = useMessages();
  const title = getTitle(messages);
  // const element = React.createElement('a', { href: '/' }, 'Hello, world!');
  // const element2 = htmlToReactParser.parse(messages.format('test'));

  // console.dir(element2);
  return (
    <Layout title={title}>
      {/* <Link href="/">ksksk</Link> */}
      <h1 className={styles.headline}>{title}</h1>
      <p>{messages.formatJsx('test')}</p>
      <p>{messages.formatJsx('test2')}</p>
      {/* <p>{messages.format('test2')}</p> */}
      {/* <p>{element}</p> */}
    </Layout>
  );
};

export default Tests;
