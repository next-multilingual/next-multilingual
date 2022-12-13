import { Layout } from '@/components/layout/Layout'
import { useCitiesMessages } from '@/messages/cities/citiesMessages'
import { NextPage } from 'next'
import Link from 'next-multilingual/link'
import { getTitle, slugify, useMessages } from 'next-multilingual/messages'
import { useRouter } from 'next-multilingual/router'
import { useLocalizedUrl } from 'next-multilingual/url'
import router from 'next/router'
import { useMemo, useState } from 'react'
import styles from './index.module.css'

const DynamicRoutesTextTests: NextPage = () => {
  const messages = useMessages()
  const { pathname, locale } = useRouter()
  const title = getTitle(messages)
  const citiesMessages = useCitiesMessages()
  const [city, setCity] = useState(citiesMessages.getAll()[0].key)

  const cityParameter = useMemo(
    (): string => slugify(citiesMessages.format(city), locale),
    [locale, citiesMessages, city]
  )

  const targetUrl = useLocalizedUrl(`${pathname}/${cityParameter}`)

  return (
    <Layout title={title}>
      <h1 className={styles.headline}>{title}</h1>
      <p>{messages.format('details')}</p>
      <div>
        <span className={styles.inlinePick}>{messages.format('pick')}</span>
        <select onChange={(event) => setCity(event.target.value)}>
          {citiesMessages.getAll().map((message) => {
            return (
              <option value={message.key} key={message.key}>
                {message.format()}
              </option>
            )
          })}
        </select>
        <span className={styles.preview}>
          {messages.formatJsx('preview', {
            localizedUrl: targetUrl,
            code: <code id="url-preview" className={styles.code}></code>,
          })}
        </span>
      </div>
      <p>{messages.format('2links')}</p>
      <ul>
        <li>
          <Link id="link-with-parameter" href={`${pathname}/${cityParameter}`}>
            {messages.format('link1Text')}
          </Link>
        </li>
        <li>
          <button id="route-push-button" onClick={() => router.push(targetUrl)}>
            {messages.format('link2Text')}
          </button>
        </li>
      </ul>
      <p>{messages.format('instructions')}</p>
    </Layout>
  )
}

export default DynamicRoutesTextTests
