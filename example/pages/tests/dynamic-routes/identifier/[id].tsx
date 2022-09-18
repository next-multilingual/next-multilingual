import { Layout } from '@/components/layout/Layout'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Link from 'next-multilingual/link'
import { getTitle, useMessages } from 'next-multilingual/messages'
import { getLocalizedRouteParameters, LocalizedRouteParameters } from 'next-multilingual/router'
import { useLocalizedUrl } from 'next-multilingual/url'
import { useRouter } from 'next/router'
import styles from './[id].module.css'

type DynamicRoutesIdTestsProps = { localizedRouteParameters: LocalizedRouteParameters }

const DynamicRoutesIdTests: NextPage<DynamicRoutesIdTestsProps> = ({
  localizedRouteParameters,
}) => {
  const messages = useMessages()
  const title = getTitle(messages)
  const { pathname, asPath, query, locale } = useRouter()

  const localizedUrl = useLocalizedUrl({
    pathname,
    query,
  })

  return (
    <Layout title={title} localizedRouteParameters={localizedRouteParameters}>
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
            <td>{messages.format('rowLocalizedWithAsPath')}</td>
            {/**
             * @see https://github.com/vercel/next.js/issues/32772 (why `suppressHydrationWarning` is used).
             *
             * If you need the `asPath` to match uniquely to each request then `getServerSideProps`
             * should be used. `getStaticProps` is not meant to be unique per request but instead
             * unique per-path.
             */}
            <td suppressHydrationWarning={true}>{asPath}</td>
          </tr>
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
        <Link href={`${pathname.split('/').slice(0, -1).join('/')}`} locale={locale}>
          {messages.format('goBack')}
        </Link>
      </div>
    </Layout>
  )
}

export default DynamicRoutesIdTests

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
// eslint-disable-next-line @typescript-eslint/require-await
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
  }
}

/**
 * Pre-compute localized route parameters and return them as props.
 */
// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticProps: GetStaticProps<DynamicRoutesIdTestsProps> = async (context) => {
  const localizedRouteParameters = getLocalizedRouteParameters(context, {
    id: context.params?.id as string,
  })

  return { props: { localizedRouteParameters } }
}
