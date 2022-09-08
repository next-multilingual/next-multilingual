import { Layout } from '@/components/layout/Layout'
import { useCitiesMessages } from '@/messages/cities/citiesMessages'
import { NextPage } from 'next'
import { getActualLocale } from 'next-multilingual'
import Link from 'next-multilingual/link'
import { getTitle, slugify, useMessages } from 'next-multilingual/messages'
import { getLocalizedUrl } from 'next-multilingual/url'
import router, { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import styles from './index.module.css'

const DynamicRoutesTextTests: NextPage = () => {
  const messages = useMessages()
  const { pathname, locale, locales, defaultLocale } = useRouter()
  const actualLocale = getActualLocale(locale, defaultLocale, locales)
  const title = getTitle(messages)
  const citiesMessages = useCitiesMessages()
  const [city, setCity] = useState(citiesMessages.getAll()[0].key)
  const getCityParameter = useCallback(
    (): string => slugify(citiesMessages.format(city), actualLocale),
    [actualLocale, citiesMessages, city]
  )
  const [cityParameter, setCityParameter] = useState(getCityParameter())

  function applyCityDropdownChange(city?: string): void {
    console.log('applyCityDropdownChange')
    console.dir(city)
    if (city !== undefined) {
      setCity(city)
    }
    setCityParameter(getCityParameter())
    setTargetUrl(getTargetUrl())
    setPreviewMessage(getPreviewMessage())
  }

  const getTargetUrl = useCallback(
    (): string =>
      getLocalizedUrl(
        {
          pathname: `${pathname}/[city]`,
          query: { city: cityParameter },
        },
        actualLocale
      ),
    [actualLocale, cityParameter, pathname]
  )
  const [targetUrl, setTargetUrl] = useState(getTargetUrl())

  const getPreviewMessage = useCallback(
    (): JSX.Element =>
      messages.formatJsx('preview', {
        localizedUrl: targetUrl,
        code: <code className={styles.code}></code>,
      }),
    [messages, targetUrl]
  )
  const [previewMessage, setPreviewMessage] = useState(getPreviewMessage())

  useEffect(() => {
    applyCityDropdownChange()
  }, [actualLocale])

  return (
    <Layout title={title}>
      <h1 className={styles.headline}>{title}</h1>
      <p>{messages.format('details')}</p>
      <div>
        <span className={styles.inlinePick}>{messages.format('pick')}</span>
        <select onChange={(event) => applyCityDropdownChange(event.target.value)} value={city}>
          {citiesMessages.getAll().map((message) => {
            return (
              <option value={message.key} key={message.key}>
                {message.format()}
              </option>
            )
          })}
        </select>
        <span className={styles.inlineRoute}>{previewMessage}</span>
      </div>
      <p>{messages.format('2links')}</p>
      <ul>
        <li>
          <Link href={{ pathname: `${pathname}/[city]`, query: { city: cityParameter } }}>
            <a id="link-with-parameter">{messages.format('link1Text')}</a>
          </Link>{' '}
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
