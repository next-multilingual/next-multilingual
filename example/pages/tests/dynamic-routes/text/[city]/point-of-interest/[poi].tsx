import { Layout } from '@/components/layout/Layout'
import { getCitiesMessages } from '@/messages/cities/citiesMessages'
import { getLondonPoiMessages } from '@/messages/cities/points-of-interest/londonPoiMessages'
import { getMontrealPoiMessages } from '@/messages/cities/points-of-interest/montrealPoiMessages'
import { getShanghaiPoiMessages } from '@/messages/cities/points-of-interest/shanghaiPoiMessages'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import {
  getStaticPathsLocales,
  getStaticPropsLocales,
  MultilingualStaticPath,
} from 'next-multilingual'
import Link from 'next-multilingual/link'
import {
  GetMessagesFunction,
  getTitle,
  Messages,
  slugify,
  useMessages,
} from 'next-multilingual/messages'
import {
  getLocalizedRouteParameters,
  LocalizedRouteParameters,
  RouteParameters,
} from 'next-multilingual/router'
import { useLocalizedUrl } from 'next-multilingual/url'
import { useRouter } from 'next/router'
import styles from './[poi].module.css'

type DynamicRoutesPoiTestsProps = { localizedRouteParameters: LocalizedRouteParameters }

const DynamicRoutesPoiTests: NextPage<DynamicRoutesPoiTestsProps> = ({
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
            <td>{messages.format('rowCityParameterValue')}</td>
            <td id="city-parameter">{query['city']}</td>
          </tr>
          <tr>
            <td>{messages.format('rowPoiParameterValue')}</td>
            <td id="poi-parameter">{query['poi']}</td>
          </tr>
        </tbody>
      </table>
      <div id="go-back">
        <Link href={`${asPath}/..`}>{messages.format('goBack')}</Link>
      </div>
    </Layout>
  )
}

export default DynamicRoutesPoiTests

/**
 * By default, Next.js does not populate the `query` value when using the `useRouter` hook.
 *
 * | The query string parsed to an object. It will be an empty object during prerendering if the page
 * | doesn't have data fetching requirements. Defaults to `{}`.
 *
 * @see https://nextjs.org/docs/api-reference/next/router
 *
 * By adding `getStaticPaths` we will pre-render all parameters values at build time. { fallback: false } will
 * display a 404 error when a value is invalid.
 */
// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticPaths: GetStaticPaths = async (context) => {
  const paths: MultilingualStaticPath[] = []
  const { locales } = getStaticPathsLocales(context)
  locales.forEach((locale) => {
    const citiesMessages = getCitiesMessages(locale)
    citiesMessages.getAll().forEach((cityMessage) => {
      let poisMessages: Messages

      switch (cityMessage.key) {
        case 'montreal': {
          poisMessages = getMontrealPoiMessages(locale)
          break
        }
        case 'london': {
          poisMessages = getLondonPoiMessages(locale)
          break
        }
        default: {
          poisMessages = getShanghaiPoiMessages(locale)
        }
      }

      poisMessages.getAll().forEach((poiMessage) => {
        paths.push({
          params: {
            city: slugify(cityMessage.format(), locale),
            poi: slugify(poiMessage.format(), locale),
          },
          locale,
        })
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
// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticProps: GetStaticProps<DynamicRoutesPoiTestsProps> = async (context) => {
  const { locale } = getStaticPropsLocales(context)
  const routeParameters = context.params as RouteParameters
  let getPoiMessages: GetMessagesFunction

  const cityKey = getCitiesMessages(locale).getRouteParameterKey(
    routeParameters.city as string
  ) as string

  switch (cityKey) {
    case 'montreal': {
      getPoiMessages = getMontrealPoiMessages
      break
    }
    case 'london': {
      getPoiMessages = getLondonPoiMessages
      break
    }
    default: {
      getPoiMessages = getShanghaiPoiMessages
    }
  }

  const localizedRouteParameters = getLocalizedRouteParameters(
    context,
    {
      city: getCitiesMessages,
      poi: getPoiMessages,
    },
    import.meta.url
  )

  return { props: { localizedRouteParameters } }
}
