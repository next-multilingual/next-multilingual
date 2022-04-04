import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link, { useLocalizedUrl } from 'next-multilingual/link';
import { getTitle, useMessages } from 'next-multilingual/messages';
import { useRouter } from 'next/router';

import Layout from '@/layout';

import styles from './[id].module.css';

const Id: NextPage = () => {
  const messages = useMessages();
  const title = getTitle(messages);
  const { pathname, asPath, query, locale } = useRouter();

  const localizedUrl = useLocalizedUrl({
    pathname,
    query,
  });

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
          {/* @see https://github.com/facebook/react/issues/24270 (re-enable test once the fix is available) */}
          {/* <tr>
            <td>{messages.format('rowLocalizedWithAsPath')}</td> */}
          {/* Adding `suppressHydrationWarning` until
            https://github.com/vercel/next.js/issues/32772 is resolved */}
          {/* <td suppressHydrationWarning={true}>{asPath}</td>
          </tr> */}
          <tr>
            <td>{messages.format('rowLocalizedWithUseLocalizedUrl')}</td>
            <td>{localizedUrl}</td>
          </tr>
          <tr>
            <td>{messages.format('rowParameterValue')}</td>
            <td>{query['id']}</td>
          </tr>
        </tbody>
      </table>
      <div id="go-back">
        <Link href="/tests/dynamic-routes" locale={locale}>
          {messages.format('goBack')}
        </Link>
      </div>
    </Layout>
  );
};

export default Id;

/**
 * By default, Next.js does not populate the `query` value when using the `useRouter` hook.
 *
 * | The query string parsed to an object. It will be an empty object during prerendering if the page
 * | doesn't have data fetching requirements. Defaults to `{}`.
 *
 * @see https://nextjs.org/docs/api-reference/next/router
 *
 * By adding `getStaticPaths` we will pre-render only the default [id] at build time. { fallback: blocking } will
 * server-render pages on-demand for other query parameters.
 *
 * Alternatively if we would not know ahead of time any value of the parameters, or did not want to pre-build
 * pages, we could have used a simple `getServerSideProps` like this:
 *
 * @example
 * Example using `getServerSideProps`:
 * ```ts
 * export const getServerSideProps: GetServerSideProps = async () => {
 *   return { props: {} }; // Empty properties, since we are only using this to get the query parameters.
 * };
 * ```
 */
export const getStaticPaths: GetStaticPaths = async () => {
  /**
   * We'll pre-render only the default [id] at build time. { fallback: blocking } will server-render pages on-demand
   * for other query parameters.
   */
  return {
    paths: [
      {
        params: {
          id: '123', // This is the default `id` of the test page.
        },
      },
    ],
    fallback: 'blocking',
  };
};

/**
 * `getStaticProps` is required for `getStaticPaths` to work.
 *
 * @returns Empty properties, since we are only using this for the static paths.
 */
export const getStaticProps: GetStaticProps = async () => {
  return { props: {} };
};
