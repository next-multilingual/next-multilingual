import { Layout } from '@/components/layout/Layout'
import { useCitiesMessages } from '@/messages/cities/citiesMessages'
import { useLondonPoiMessages } from '@/messages/cities/points-of-interest/londonPoiMessages'
import { useMontrealPoiMessages } from '@/messages/cities/points-of-interest/montrealPoiMessages'
import { useShanghaiPoiMessages } from '@/messages/cities/points-of-interest/shanghaiPoiMessages'
import { NextPage } from 'next'
import Link from 'next-multilingual/link'
import { getTitle, Messages, slugify, useMessages } from 'next-multilingual/messages'
import { hydrateRouteParameters, useRouter } from 'next-multilingual/router'
import { getLocalizedUrl } from 'next-multilingual/url'
import router from 'next/router'
import { ChangeEvent, useCallback, useMemo, useState } from 'react'
import { DynamicRoutesCityTestsProps } from './..'
import styles from './index.module.css'

const DynamicRoutesPointOfInterestTests: NextPage<DynamicRoutesCityTestsProps> = ({
  localizedRouteParameters,
}) => {
  const messages = useMessages()
  const { pathname, asPath, locale } = useRouter()
  const title = getTitle(messages)
  const citiesMessages = useCitiesMessages()
  const montrealPoiMessages = useMontrealPoiMessages()
  const londonPoiMessages = useLondonPoiMessages()
  const shanghaiPoiMessages = useShanghaiPoiMessages()

  const [city, setCity] = useState(
    citiesMessages.getRouteParameterKey(localizedRouteParameters[locale].city as string) as string
  )

  const getPoiMessages = useCallback(
    (newCity?: string): Messages => {
      switch (newCity ?? city) {
        case 'london': {
          return londonPoiMessages
        }
        case 'shanghai': {
          return shanghaiPoiMessages
        }
        default: {
          // Defaults to the first option in the dropdown.
          return montrealPoiMessages
        }
      }
    },
    [city, londonPoiMessages, montrealPoiMessages, shanghaiPoiMessages]
  )

  const [poi, setPoi] = useState(getPoiMessages().getAll()[0].key)

  const handleCityChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const newCity = event.target.value
    setCity(newCity)
    const poiMessages = getPoiMessages(newCity)
    setPoi(poiMessages.getAll()[0].key)
  }

  const cityParameter = useMemo(
    (): string => slugify(citiesMessages.format(city), locale),
    [locale, citiesMessages, city]
  )

  const poiParameter = useMemo(
    (): string => slugify(getPoiMessages().format(poi), locale),
    [locale, getPoiMessages, poi]
  )

  const targetUrl = useMemo(
    (): string =>
      getLocalizedUrl(
        hydrateRouteParameters(`${pathname}/[poi]`, { city: cityParameter, poi: poiParameter }),
        locale
      ),
    [locale, cityParameter, pathname, poiParameter]
  )

  return (
    <Layout title={title} localizedRouteParameters={localizedRouteParameters}>
      <h1 className={styles.headline}>{title}</h1>
      <p>{messages.format('details')}</p>
      <div>{messages.format('pick')}</div>
      <div className={styles.picker}>
        <ul>
          <li>
            <label>
              {messages.format('cityLabel')}
              <select onChange={handleCityChange} value={city}>
                {citiesMessages.getAll().map((message) => {
                  return (
                    <option value={message.key} key={message.key}>
                      {message.format()}
                    </option>
                  )
                })}
              </select>
            </label>
          </li>
          <li>
            <label>
              {messages.format('poiLabel')}
              <select onChange={(event) => setPoi(event.target.value)}>
                {getPoiMessages()
                  .getAll()
                  .map((message) => {
                    return (
                      <option value={message.key} key={message.key}>
                        {message.format()}
                      </option>
                    )
                  })}
              </select>
            </label>
          </li>
        </ul>
      </div>
      <div>
        {messages.formatJsx('preview', {
          localizedUrl: targetUrl,
          code: <code id="url-preview" className={styles.code}></code>,
          strong: <strong></strong>,
        })}
      </div>
      <p>{messages.format('2links')}</p>
      <ul>
        <li>
          <Link href={`${asPath}/${poiParameter}`}>
            <a id="link-with-parameter">{messages.format('link1Text')}</a>
          </Link>
        </li>
        <li>
          <button id="route-push-button" onClick={() => router.push(targetUrl)}>
            {messages.format('link2Text')}
          </button>
        </li>
      </ul>
      <p>{messages.format('instructions')}</p>
      <div id="go-back">
        <Link href={`${asPath}/..`}>{messages.format('goBack')}</Link>
      </div>
    </Layout>
  )
}

export default DynamicRoutesPointOfInterestTests

export { getStaticPaths, getStaticProps } from './..'
