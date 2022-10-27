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
import styles from './[[...category]].module.css'

type CategoryCatchAllTestsProps = { localizedRouteParameters: LocalizedRouteParameters }

const CategoryCatchAllTests: NextPage<CategoryCatchAllTestsProps> = ({
  localizedRouteParameters,
}) => {
  const messages = useMessages()
  const title = getTitle(messages)
  const { pathname, asPath, query, locale } = useRouter()

  const categoryMessages = messages
    .getAll()
    .filter((message) => message.key.startsWith('categoryParameter'))

  const firstCategory = categoryMessages[0].format()
  const secondCategory = categoryMessages[1].format()

  return (
    <Layout title={title} localizedRouteParameters={localizedRouteParameters}>
      <h1 className={styles.headline}>{title}</h1>
      <p>{messages.format('details')}</p>
      <p>
        <strong>{messages.format('routerPathnameLabel')}</strong>
        {pathname}
      </p>
      <p>
        <strong>{messages.format('routerQueryLabel')}</strong>
        {JSON.stringify(query)}
      </p>
      <p>
        <strong>{messages.format('localizedRouteParametersLabel')}</strong>
        {JSON.stringify(localizedRouteParameters)}
      </p>
      <p>
        <strong>{messages.format('categoryLinkLabel')}</strong>&nbsp;
        <Link
          href={`${hydrateRouteParameters(pathname, {
            category: [slugify(firstCategory, locale), slugify(secondCategory, locale)],
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

export default CategoryCatchAllTests

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
      if (firstMessages.key.startsWith('categoryParameter')) {
        const slugifiedFirstMessage = slugify(firstMessages.format(), locale)
        paths.push({
          params: {
            category: [slugifiedFirstMessage],
          },
          locale,
        })
        // Add a second level.
        messages.getAll().forEach((secondMessages) => {
          if (secondMessages !== firstMessages) {
            paths.push({
              params: {
                category: [slugifiedFirstMessage, slugify(secondMessages.format(), locale)],
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
export const getStaticProps: GetStaticProps<CategoryCatchAllTestsProps> = async (context) => {
  const localizedRouteParameters = getLocalizedRouteParameters(
    context,
    {
      category: [getMessages, getMessages],
    },
    import.meta.url
  )

  return { props: { localizedRouteParameters } }
}
