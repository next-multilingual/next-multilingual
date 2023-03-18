import { Layout } from '@/components/layout/Layout'
import { getCitiesMessages } from '@/messages/cities/citiesMessages'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { MultilingualStaticPath, getStaticPathsLocales } from 'next-multilingual'
import Link from 'next-multilingual/link'
import { getTitle, slugify, useMessages } from 'next-multilingual/messages'
import {
  LocalizedRouteParameters,
  getLocalizedRouteParameters,
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
  const localizedUrl = useLocalizedUrl(asPath)

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
             * Using `suppressHydrationWarning` until we get more details from Next.js.
             * @see https://github.com/vercel/next.js/issues/41741
             */}
            <td suppressHydrationWarning={true}>{asPath}</td>
          </tr>
          <tr>
            <td>{messages.format('rowLocalizedWithUseLocalizedUrl')}</td>
            <td>{localizedUrl}</td>
          </tr>
          <tr>
            <td>{messages.format('rowParameterValue')}</td>
            <td>{query['cityName']}</td>
          </tr>
        </tbody>
      </table>
      <div id="go-to-poi">
        <Link href={`${asPath}/point-of-interest`}>{messages.format('goToPoi')}</Link>
      </div>
      <div id="go-back">
        <Link href={`${asPath}/..`}>{messages.format('goBack')}</Link>
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
  const { locales } = getStaticPathsLocales(context)
  locales.forEach((locale) => {
    const citiesMessages = getCitiesMessages(locale)
    citiesMessages.getAll().forEach((cityMessage) => {
      paths.push({
        params: {
          cityName: slugify(cityMessage.format(), locale),
        },
        locale,
      })
    })
  })
  return {
    paths,
    /** @todo: set back to `false` once https://github.com/vercel/next.js/issues/40591 is fixed */
    fallback: 'blocking',
  }
}

/**
 * Pre-compute the localized route parameters and return them as props.
 */
export const getStaticProps: GetStaticProps<DynamicRoutesCityTestsProps> =
  // eslint-disable-next-line @typescript-eslint/require-await
  async (context) => {
    const localizedRouteParameters = getLocalizedRouteParameters(
      context,
      {
        // ❗ Note that the parameter name `cityName` was purposefully chosen to implicitly test casing.
        cityName: getCitiesMessages,
      },
      import.meta.url
    )

    return { props: { localizedRouteParameters } }
  }
