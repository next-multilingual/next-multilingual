import { Layout } from '@/components/layout/Layout'
import { NextPage } from 'next'
import Link from 'next-multilingual/link'
import { getTitle, slugify, useMessages } from 'next-multilingual/messages'
import { useRouter } from 'next-multilingual/router'
import { useLocalizedUrl } from 'next-multilingual/url'
import styles from './index.module.css'
import { getCountryMessages } from './[...country]'

const CatchAllDynamicRoutesTests: NextPage = () => {
  const messages = useMessages()
  const { locale, pathname, asPath } = useRouter()
  const countryMessages = getCountryMessages(locale)
  const firstCountry = countryMessages
    .getAll()
    .find((messages) => messages.key.startsWith('countryParameter'))
    ?.format() as string

  const title = getTitle(messages)

  /**
   * Optional catch-all indexes are treated like static path when they contain no parent dynamic route so we can use `pathname`.
   *
   * By using `pathname` we will do simple non-localized to localize URL matching.
   */
  const categoryUrlPath = `${pathname}/category`
  const localizedCategoryUrl = useLocalizedUrl(categoryUrlPath, undefined, undefined, false, true)

  /**
   * Because this URL is not optional, we can use `asPath` and localize its parameters directly so the URL is fully localized.
   *
   * By doing this we will be able to use the URL directly without needing to match it with the non-localize URL.
   */
  const countryUrlPath = `${asPath}/${slugify(firstCountry, locale)}`
  const localizedCountryUrl = useLocalizedUrl(countryUrlPath, undefined, undefined, false, true)

  return (
    <Layout title={title}>
      <h1 className={styles.headline}>{title}</h1>
      <p>{messages.format('details')}</p>
      <ul>
        <li>
          <Link id="category-link" href={categoryUrlPath}>
            {messages.format('categoryLinkLabel')}
          </Link>
          <input type="hidden" id="category-hidden-input" value={localizedCategoryUrl} />
        </li>
        <li>
          <strong>{messages.format('countryLinkLabel')}</strong>&nbsp;
          <Link href={countryUrlPath} id="country-link">
            {firstCountry}
          </Link>
          <input type="hidden" id="country-hidden-input" value={localizedCountryUrl} />
        </li>
      </ul>
    </Layout>
  )
}

export default CatchAllDynamicRoutesTests
