import { Layout } from '@/components/layout/Layout'
import { getCitiesMessages } from '@/messages/cities/citiesMessages'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import {
  getActualLocales,
  MultilingualStaticPath,
  MultilingualStaticProps,
} from 'next-multilingual'
import Link from 'next-multilingual/link'
import { getTitle, slugify, useMessages } from 'next-multilingual/messages'
import {
  getLocalizedRouteParameters,
  LocalizedRouteParameters,
  RouteParameters,
  useRouter,
} from 'next-multilingual/router'
import { useLocalizedUrl } from 'next-multilingual/url'
import styles from './index.module.css'

export type DynamicRoutesCityTestsProps = { localizedRouteParameters: LocalizedRouteParameters }

const DynamicRoutesCityTests: NextPage<DynamicRoutesCityTestsProps> = ({
  localizedRouteParameters,
}) => {
  const messages = useMessages()
  const title = getTitle(messages)
  const { pathname, asPath, query } = useRouter()

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
            <td>{query['city']}</td>
          </tr>
        </tbody>
      </table>
      <div id="go-to-poi">
        <Link href={{ pathname: `${pathname}/point-of-interest`, query }}>
          {messages.format('goToPoi')}
        </Link>
      </div>
      <div id="go-back">
        <Link href={`${pathname.split('/').slice(0, -1).join('/')}`}>
          {messages.format('goBack')}
        </Link>
      </div>
    </Layout>
  )
}

export default DynamicRoutesCityTests

/**
 * By default, Next.js does not populate the `query` value when using the `useRouter` hook.
 *
 * | The query string parsed to an object. It will be an empty object during prerendering if the page
 * | doesn't have data fetching requirements. Defaults to `{}`.
 *
 * @see https://nextjs.org/docs/api-reference/next/router
 *
 * By adding `getStaticPaths` we will pre-render all [city] values at build time. { fallback: false } will
 * display a 404 error when a value is invalid.
 */
// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticPaths: GetStaticPaths = async (context) => {
  const paths: MultilingualStaticPath[] = []
  const actualLocales = getActualLocales(context.locales, context.defaultLocale)
  actualLocales.forEach((locale) => {
    const citiesMessages = getCitiesMessages(locale)
    citiesMessages.getAll().forEach((cityMessage) => {
      paths.push({
        params: {
          city: slugify(cityMessage.format(), locale),
        },
        locale,
      })
    })
  })

  return {
    paths,
    fallback: false,
  }
}

/**
 * `getStaticProps` is required for `getStaticPaths` to work.
 *
 * @returns Empty properties, since we are only using this for the static paths.
 */
export const getStaticProps: MultilingualStaticProps<
  GetStaticProps<DynamicRoutesCityTestsProps>
> = async ({
  locale,
  defaultLocale,
  locales,
  params,
  // eslint-disable-next-line @typescript-eslint/require-await
}) => {
  const routeParameters = params as RouteParameters
  const localizedRouteParameters = getLocalizedRouteParameters(
    locale,
    defaultLocale,
    locales,
    routeParameters,
    {
      city: getCitiesMessages,
    }
  )

  return { props: { localizedRouteParameters } }
}
