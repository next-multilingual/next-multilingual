import { NextPage } from 'next';
import Link from 'next-multilingual/link';
import { getTitle, slugify, useMessages } from 'next-multilingual/messages';
import { useRouter } from 'next/router';

import Layout from '@/layout';

import styles from './long-page.module.css';

const LongPage: NextPage = () => {
  const messages = useMessages();
  const title = getTitle(messages);
  const { locale } = useRouter();

  return (
    <Layout title={title}>
      <h1 className={styles.headline}>{title}</h1>
      <div>
        <h2>{messages.format('tableOfContent')}</h2>
        <ul>
          <li>
            <Link href={`#${slugify(messages.format('p1Header'), locale)}`}>
              {messages.format('p1Header')}
            </Link>
          </li>
          <li>
            <Link href={`#${slugify(messages.format('p2Header'), locale)}`}>
              {messages.format('p2Header')}
            </Link>
          </li>
          <li>
            <Link href={`#${slugify(messages.format('p3Header'), locale)}`}>
              {messages.format('p3Header')}
            </Link>
          </li>
          <li>
            <Link href={`#${slugify(messages.format('p4Header'), locale)}`}>
              {messages.format('p4Header')}
            </Link>
          </li>
          <li>
            <Link href={`#${slugify(messages.format('p5Header'), locale)}`}>
              {messages.format('p5Header')}
            </Link>
          </li>
        </ul>
      </div>
      <div className={styles.content}>
        <h2 id={slugify(messages.format('p1Header'), locale)}>{messages.format('p1Header')}</h2>
        <p>{messages.format('p1')}</p>
        <h2 id={slugify(messages.format('p2Header'), locale)}>{messages.format('p2Header')}</h2>
        <p>{messages.format('p2')}</p>
        <h2 id={slugify(messages.format('p3Header'), locale)}>{messages.format('p3Header')}</h2>
        <p>{messages.format('p3')}</p>
        <h2 id={slugify(messages.format('p4Header'), locale)}>{messages.format('p4Header')}</h2>
        <p>{messages.format('p4')}</p>
        <h2 id={slugify(messages.format('p5Header'), locale)}>{messages.format('p5Header')}</h2>
        <p>{messages.format('p5')}</p>
      </div>
    </Layout>
  );
};

export default LongPage;

export const useLongPageMessages = useMessages;
