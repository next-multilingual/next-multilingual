import { useMessages, getTitle } from 'next-multilingual/messages';
import { ReactElement, useState } from 'react';
import Layout from '@/layout';
import styles from './index.module.css';
import Link, { useLocalizedUrl } from 'next-multilingual/link';
import router, { useRouter } from 'next/router';

export default function Tests(): ReactElement {
  const messages = useMessages();
  const { pathname } = useRouter();
  const title = getTitle(messages);

  const [parameter, setParameter] = useState('123');

  const localizedUrl = useLocalizedUrl({
    pathname: `${pathname}/[id]`,
    query: { id: parameter },
  });

  return (
    <Layout title={title}>
      <h1 className={styles.headline}>{title}</h1>
      <p>{messages.format('details')}</p>
      <p>
        {messages.format('intro1')} <code className={styles.code}>/dynamic-route/test/[id]</code>{' '}
        {messages.format('intro2')}
      </p>
      <div className={styles.parameter}>
        <label>
          {messages.format('parameterLabel')}
          <input
            type="text"
            value={parameter}
            id="parameter-input"
            onChange={(event) => setParameter(event.target.value)}
          ></input>
        </label>
      </div>
      <ul>
        <li>
          <Link href={{ pathname: `${pathname}/[id]`, query: { id: parameter } }}>
            <a id="link-with-parameter">{messages.format('link1Text')}</a>
          </Link>{' '}
        </li>
        <li>
          <button id="route-push-button" onClick={() => router.push(localizedUrl)}>
            {messages.format('link2Text')}
          </button>
        </li>
      </ul>
      <p>{messages.format('instructions')}</p>
    </Layout>
  );
}
