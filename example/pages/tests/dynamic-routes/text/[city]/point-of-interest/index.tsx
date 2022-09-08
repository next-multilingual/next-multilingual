import { Layout } from '@/components/layout/Layout'
import { useCitiesMessages } from '@/messages/cities/citiesMessages'
import { useLondonPoiMessages } from '@/messages/cities/points-of-interest/londonPoiMessages'
import { useMontrealPoiMessages } from '@/messages/cities/points-of-interest/montrealPoiMessages'
import { useShanghaiPoiMessages } from '@/messages/cities/points-of-interest/shanghaiPoiMessages'
import { NextPage } from 'next'
import { getActualLocale } from 'next-multilingual'
import Link from 'next-multilingual/link'
import { getTitle, Messages, slugify, useMessages } from 'next-multilingual/messages'
import { getLocalizedUrl } from 'next-multilingual/url'
import router, { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { DynamicRoutesCityTestsProps } from './..'
import styles from './index.module.css'

const DynamicRoutesPointOfInterestTests: NextPage<DynamicRoutesCityTestsProps> = ({
  localizedRouteParameters,
}) => {
  const messages = useMessages()
  const { pathname, locale, locales, defaultLocale, query } = useRouter()
  const actualLocale = getActualLocale(locale, defaultLocale, locales)
  const title = getTitle(messages)
  const citiesMessages = useCitiesMessages()
  const montrealPoiMessages = useMontrealPoiMessages()
  const londonPoiMessages = useLondonPoiMessages()
  const shanghaiPoiMessages = useShanghaiPoiMessages()

  const [city, setCity] = useState(citiesMessages.getAll()[0].key)
  const getCityParameter = useCallback(
    (): string => slugify(citiesMessages.format(city), actualLocale),
    [actualLocale, citiesMessages, city]
  )
  const [cityParameter, setCityParameter] = useState(getCityParameter())

  const getPoiMessages = useCallback((): Messages => {
    switch (city) {
      case 'montreal': {
        return montrealPoiMessages
      }
      case 'london': {
        return londonPoiMessages
      }
      default: {
        return shanghaiPoiMessages
      }
    }
  }, [city, londonPoiMessages, montrealPoiMessages, shanghaiPoiMessages])

  const getPoi = useCallback((): string => getPoiMessages().getAll()[0].key, [getPoiMessages])
  const [poi, setPoi] = useState(getPoi())

  const getPoiParameter = useCallback(
    (): string => slugify(getPoiMessages().format(poi), actualLocale),
    [actualLocale, getPoiMessages, poi]
  )
  const [poiParameter, setPoiParameter] = useState(getPoiParameter())

  const getPoiOptions = useCallback((): JSX.Element[] => {
    return getPoiMessages()
      .getAll()
      .map((message) => {
        return (
          <option value={message.key} key={message.key}>
            {message.format()}
          </option>
        )
      })
  }, [getPoiMessages])
  const [poiOptions, setPoiOptions] = useState(getPoiOptions())

  const getTargetUrl = useCallback(
    (): string =>
      getLocalizedUrl(
        {
          pathname: `${pathname}/[poi]`,
          query: { city: cityParameter, poi: poiParameter },
        },
        actualLocale
      ),
    [actualLocale, cityParameter, pathname, poiParameter]
  )
  const [targetUrl, setTargetUrl] = useState(getTargetUrl())

  useEffect(() => {
    setCityParameter(getCityParameter())
    setPoiOptions(getPoiOptions())
    setPoi(getPoi())
    setPoiParameter(getPoiParameter())
    setTargetUrl(getTargetUrl())
  }, [actualLocale, pathname, poi, poiParameter])

  return (
    <Layout title={title} localizedRouteParameters={localizedRouteParameters}>
      <h1 className={styles.headline}>{title}</h1>
      <p>{messages.format('details')}</p>
      <div>{messages.format('pick')}</div>
      <div className={styles.picker}>
        <ul>
          <li>
            <label>
              City:
              <select onChange={(event) => setCity(event.target.value)} value={city}>
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
              Point of interest:
              <select onChange={(event) => setPoi(event.target.value)} value={poi}>
                {poiOptions}
              </select>
            </label>
          </li>
        </ul>
      </div>
      <div>
        {messages.formatJsx('preview', {
          localizedUrl: targetUrl,
          code: <code className={styles.code}></code>,
          strong: <strong></strong>,
        })}
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
      <div id="go-back">
        <Link href={{ pathname: `${pathname.split('/').slice(0, -1).join('/')}`, query }}>
          {messages.format('goBack')}
        </Link>
      </div>
    </Layout>
  )
}

export default DynamicRoutesPointOfInterestTests

export { getStaticPaths, getStaticProps } from './..'
