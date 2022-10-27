import { Layout } from '@/components/layout/Layout'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { getStaticPathsLocales, MultilingualStaticPath } from 'next-multilingual'
import Link from 'next-multilingual/link'
import { getMessages, getTitle, slugify, useMessages } from 'next-multilingual/messages'
import {
  getLocalizedRouteParameters,
  hydrateRouteParameters,
  LocalizedRouteParameters,
  useRouter,
} from 'next-multilingual/router'
import styles from './[...country].module.css'

type CountryCatchAllTestsProps = { localizedRouteParameters: LocalizedRouteParameters }

const CountryCatchAllTests: NextPage<CountryCatchAllTestsProps> = ({
  localizedRouteParameters,
}) => {
  const messages = useMessages()
  const title = getTitle(messages)
  const { locale, asPath, pathname, query } = useRouter()

  const countryMessages = messages
    .getAll()
    .filter((message) => message.key.startsWith('countryParameter'))

  const firstCategory = countryMessages[0].format()
  const secondCategory = countryMessages[1].format()

  return (
    <Layout title={title} localizedRouteParameters={localizedRouteParameters}>
      <h1 className={styles.headline}>{title}</h1>
      <p>{messages.format('details')}</p>
      <p>
        <strong>{messages.format('routerQueryLabel')}</strong>
        {JSON.stringify(query)}
      </p>
      <p>
        <strong>{messages.format('localizedRouteParametersLabel')}</strong>
        {JSON.stringify(localizedRouteParameters)}
      </p>
      <p>
        <strong>{messages.format('countryLinkLabel')}</strong>&nbsp;
        <Link
          href={`${hydrateRouteParameters(pathname, {
            country: [slugify(firstCategory, locale), slugify(secondCategory, locale)],
          })}`}
        >
          <a id="link-with-2-parameters">{`${firstCategory} / ${secondCategory}`}</a>
        </Link>
      </p>
      <div id="go-back">
        <Link href={`${asPath}/..`}>{messages.format('goBack')}</Link>
      </div>
    </Layout>
  )
}

export default CountryCatchAllTests

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
    const messages = getMessages(locale)
    messages.getAll().forEach((firstMessages) => {
      if (firstMessages.key.startsWith('countryParameter')) {
        const slugifiedFirstMessage = slugify(firstMessages.format(), locale)
        paths.push({
          params: {
            country: [slugifiedFirstMessage],
          },
          locale,
        })
        // Add a second level.
        messages.getAll().forEach((secondMessages) => {
          if (secondMessages !== firstMessages) {
            paths.push({
              params: {
                country: [slugifiedFirstMessage, slugify(secondMessages.format(), locale)],
              },
              locale,
            })
          }
        })
      }
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
export const getStaticProps: GetStaticProps<CountryCatchAllTestsProps> = async (context) => {
  const localizedRouteParameters = getLocalizedRouteParameters(
    context,
    {
      country: [getMessages, getMessages],
    },
    import.meta.url
  )

  return { props: { localizedRouteParameters } }
}

export { getMessages as getCountryMessages } from 'next-multilingual/messages'
