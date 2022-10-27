import { Layout } from '@/components/layout/Layout'
import { useFruitsMessages } from '@/messages/fruits/useFruitsMessages'
import type { GetServerSideProps, NextPage } from 'next'
import {
  normalizeLocale,
  ResolvedLocaleServerSideProps,
  resolveLocale,
  useResolvedLocale,
} from 'next-multilingual'
import { getTitle, useMessages } from 'next-multilingual/messages'
import { useRouter } from 'next-multilingual/router'
import { useRouter as useNextRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { HelloApiSchema } from './api/hello'
import styles from './index.module.css'

const Homepage: NextPage<ResolvedLocaleServerSideProps> = ({ resolvedLocale }) => {
  // Force Next.js to use a locale that was resolved dynamically on the homepage (this must be the first action on the homepage).
  useResolvedLocale(resolvedLocale)
  const { locale, locales, defaultLocale, basePath } = useRouter()
  const nextRouter = useNextRouter()

  // Load the messages in the correct locale.
  const messages = useMessages()
  const fruitsMessages = useFruitsMessages()

  const [fruit, setFruit] = useState(fruitsMessages.getAll()[0].key)

  // Counter used for ICU MessageFormat example.
  const [count, setCount] = useState(0)

  // Localized API.
  const [apiError, setApiError] = useState<DOMException | null>()
  const [isApiLoaded, setApiIsLoaded] = useState(false)
  const [apiMessage, setApiMessage] = useState('')
  const controllerRef = useRef<AbortController | null>()

  useEffect(() => {
    if (controllerRef.current) {
      /**
       * This controller allows to abort "queued" requests. Without this, someone could switch language
       * and an API response in the wrong language could be displayed. Every time `abort` called, it
       * will trigger an error which we ignore below.
       */
      controllerRef.current.abort()
    }
    const controller = new AbortController()
    controllerRef.current = controller

    setApiIsLoaded(false)
    const requestHeaders: HeadersInit = new Headers()
    requestHeaders.set('Accept-Language', normalizeLocale(locale))
    fetch(`${basePath}/api/hello`, {
      headers: requestHeaders,
      signal: controllerRef.current?.signal,
    })
      .then((result) => result.json())
      .then(
        (result) => {
          const apiResponse = result as unknown as HelloApiSchema
          setApiIsLoaded(true)
          setApiMessage(apiResponse.message)
          controllerRef.current = undefined
        },
        (apiError: DOMException) => {
          if (apiError.name !== 'AbortError') {
            // Only show valid errors.
            setApiIsLoaded(true)
            setApiError(apiError)
          }
        }
      )
  }, [locale, basePath])

  const showApiMessage: React.FC = () => {
    if (apiError) {
      return (
        <>
          {messages.format('apiError')}
          {apiError.message}
        </>
      )
    } else if (!isApiLoaded) {
      return <>{messages.format('apiLoading')}</>
    } else {
      return <>{apiMessage}</>
    }
  }

  return (
    <Layout title={getTitle(messages)}>
      <h1 className={styles.headline}>{messages.format('headline')}</h1>
      <div>
        <h2 className={styles.subHeader}>{messages.format('subHeader')}</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{messages.format('columnInformation')}</th>
              <th>{messages.format('columnNextJs')}</th>
              <th>{messages.format('columnActual')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{messages.format('rowDefaultLocale')}</td>
              <td>{normalizeLocale(nextRouter.defaultLocale as string)}</td>
              <td>{normalizeLocale(defaultLocale)}</td>
            </tr>
            <tr>
              <td>{messages.format('rowConfiguredLocales')}</td>
              <td>
                {(nextRouter.locales as string[])
                  .map((locale) => normalizeLocale(locale))
                  .join(', ')}
              </td>
              <td>{locales.map((locale) => normalizeLocale(locale)).join(', ')}</td>
            </tr>
          </tbody>
        </table>
        <br />
        <div id="shared-messages">
          <h2>{messages.format('sharedHeader')}</h2>
          <div>
            {messages.format('sharedList')}
            <i>
              {fruitsMessages
                .getAll()
                .map((message) => message.format())
                .join(', ')}
            </i>
          </div>
          <div>
            {messages.format('sharedDropDown')}
            <select onChange={(event) => setFruit(event.target.value)} value={fruit}>
              {fruitsMessages.getAll().map((message) => (
                <option value={message.key} key={message.key}>
                  {message.format()}
                </option>
              ))}
            </select>
          </div>
        </div>
        <br />
        <div>
          <h2>{messages.format('mfHeader')}</h2>
          <fieldset className={styles.mfExample}>
            <legend>{messages.format('mfUsing')}</legend>
            {messages.format('mfPlural')}
          </fieldset>
          <p id="plural-messages-output">{messages.format('mfPlural', { count })}</p>
          <button
            id="plural-messages-add"
            onClick={() => setCount(count + 1)}
            title={messages.format('mfAddCandy')}
          >
            ➕🍭
          </button>
          <button
            id="plural-messages-subtract"
            onClick={() => {
              if (count > 0) setCount(count - 1)
            }}
            title={messages.format('mfRemoveCandy')}
          >
            ➖🍭
          </button>
        </div>
        <br />
        <div>
          <h2>{messages.format('apiHeader')}</h2>
          <div id="api-response">{showApiMessage({})}</div>
        </div>
      </div>
    </Layout>
  )
}

export default Homepage

export const getServerSideProps: GetServerSideProps<ResolvedLocaleServerSideProps> = async (
  context
  // eslint-disable-next-line @typescript-eslint/require-await
) => {
  return {
    props: {
      resolvedLocale: resolveLocale(context),
    },
  }
}
