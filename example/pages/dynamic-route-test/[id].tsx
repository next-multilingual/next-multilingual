import { useMessages, getTitle } from 'next-multilingual/messages';
import type { ReactElement } from 'react';
import Layout from '@/layout';
import styles from './[id].module.css';
import { useRouter } from 'next/router';
import Link from 'next-multilingual/link';
import { GetServerSideProps } from 'next';

export default function Id(): ReactElement {
  const messages = useMessages();
  const title = getTitle(messages);
  const { pathname, asPath, query, locale } = useRouter();

  return (
    <Layout title={title}>
      <h1 className={styles.headline}>{title}</h1>
      <p>{messages.format('details')}</p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{messages.format('columnInformation')}</th>
            <th>{messages.format('columnValue')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{messages.format('rowNonLocalizedPagePath')}</td>
            <td>{pathname}</td>
          </tr>
          <tr>
            <td>{messages.format('rowLocalizedPagePath')}</td>
            <td>{asPath}</td>
          </tr>
          <tr>
            <td>{messages.format('rowParameterValue')}</td>
            <td>{query['id']}</td>
          </tr>
        </tbody>
      </table>
      <div id="go-back">
        <Link href="/dynamic-route-test" locale={locale}>
          {messages.format('goBack')}
        </Link>
      </div>
    </Layout>
  );
}

/**
 * By default, Next.js does not populate the `query` value when using the `useRouter` hook.
 *
 * | The query string parsed to an object. It will be an empty object during prerendering if the page
 * | doesn't have data fetching requirements. Defaults to `{}`.
 *
 * @see https://nextjs.org/docs/api-reference/next/router
 *
 * By adding a `getServerSideProps`, Next.js will populate query parameters automatically and make them available
 * for SSR. This will allow to get the SEO benefits from SSR markup.
 */
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
