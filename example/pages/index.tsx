import {
    getActualDefaultLocale, getActualLocale, getActualLocales, getCookieLocale, getPreferredLocale,
    normalizeLocale, ResolvedLocaleServerSideProps, setCookieLocale
} from 'next-multilingual';
import { getTitle, useMessages } from 'next-multilingual/messages';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Layout from '@/layout';

import { useFruitsMessages } from '../messages/useFruitsMessages';
import styles from './index.module.css';

import type { GetServerSideProps, NextPage } from 'next';
const Home: NextPage<ResolvedLocaleServerSideProps> = ({ resolvedLocale }) => {
  const router = useRouter();
  const { locales, defaultLocale } = router;

  // Overwrite the locale with the resolved locale.
  router.locale = resolvedLocale;
  setCookieLocale(router.locale);

  // Load the messages in the correct locale.
  const messages = useMessages();
  const fruitsMessages = useFruitsMessages();

  // Counter used for ICU MessageFormat example.
  const [count, setCount] = useState(0);

  // Localized API.
  const [apiError, setApiError] = useState(null);
  const [isApiLoaded, setApiIsLoaded] = useState(false);
  const [apiMessage, setApiMessage] = useState('');

  useEffect(() => {
    setApiIsLoaded(false);
    const requestHeaders: HeadersInit = new Headers();
    requestHeaders.set('Accept-Language', normalizeLocale(router.locale));
    fetch('/api/hello', { headers: requestHeaders })
      .then((result) => result.json())
      .then(
        (result) => {
          setApiIsLoaded(true);
          setApiMessage(result.message);
        },
        (apiError) => {
          setApiIsLoaded(true);
          setApiError(apiError);
        }
      );
  }, [router.locale]);

  function showApiMessage(): JSX.Element {
    if (apiError) {
      return (
        <>
          {messages.format('apiError')}
          {apiError.message}
        </>
      );
    } else if (!isApiLoaded) {
      return <>{messages.format('apiLoading')}</>;
    } else {
      return <>{apiMessage}</>;
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
              <td>{normalizeLocale(defaultLocale)}</td>
              <td>{normalizeLocale(getActualDefaultLocale(locales, defaultLocale))}</td>
            </tr>
            <tr>
              <td>{messages.format('rowConfiguredLocales')}</td>
              <td>{locales.map((locale) => normalizeLocale(locale)).join(', ')}</td>
              <td>
                {getActualLocales(locales, defaultLocale)
                  .map((locale) => normalizeLocale(locale))
                  .join(', ')}
              </td>
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
            <select>
              {fruitsMessages.getAll().map((message) => (
                <option key={message.format()}>{message.format()}</option>
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
              if (count > 0) setCount(count - 1);
            }}
            title={messages.format('mfRemoveCandy')}
          >
            ➖🍭
          </button>
        </div>
        <br />
        <div>
          <h2>{messages.format('apiHeader')}</h2>
          <div id="api-response">{showApiMessage()}</div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps<ResolvedLocaleServerSideProps> = async (
  nextPageContext
) => {
  const { req, locale, locales, defaultLocale } = nextPageContext;

  const actualLocales = getActualLocales(locales, defaultLocale);
  const actualDefaultLocale = getActualDefaultLocale(locales, defaultLocale);
  const cookieLocale = getCookieLocale(nextPageContext, actualLocales);
  let resolvedLocale = getActualLocale(locale, defaultLocale, locales);

  // When Next.js tries to use the default locale, try to find a better one.
  if (locale === defaultLocale) {
    resolvedLocale = cookieLocale
      ? cookieLocale
      : getPreferredLocale(
          req.headers['accept-language'],
          actualLocales,
          actualDefaultLocale
        ).toLowerCase();
  }

  return {
    props: {
      resolvedLocale,
    },
  };
};
