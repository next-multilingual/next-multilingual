import Cookies from 'nookies';
import {
  getActualLocales,
  getActualDefaultLocale,
  normalizeLocale,
  getActualLocale,
  getPreferredLocale
} from 'next-multilingual';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import Layout from '@/layout';
import type {
  MulMessages,
  MulMessagesServerSideProps
} from 'next-multilingual/messages';
import styles from './index.module.css';

export default function IndexPage({
  messages,
  resolvedLocale
}: MulMessagesServerSideProps): ReactElement {
  const router = useRouter();
  const { locales, defaultLocale } = router;
  router.locale = resolvedLocale; // Overwrite the router's locale with the resolved locale.

  return (
    <Layout title={messages.title}>
      <h1 className={styles.headline}>{messages.headline}</h1>
      <div>
        <h2 className={styles.subHeader}>{messages.subHeader}</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{messages.columnInformation}</th>
              <th>{messages.columnNextJs}</th>
              <th>{messages.columnActual}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{messages.rowDefaultLocale}</td>
              <td>{normalizeLocale(defaultLocale)}</td>
              <td>
                {normalizeLocale(
                  getActualDefaultLocale(locales, defaultLocale)
                )}
              </td>
            </tr>
            <tr>
              <td>{messages.rowConfiguredLocales}</td>
              <td>
                {locales.map((locale) => normalizeLocale(locale)).join(', ')}
              </td>
              <td>
                {getActualLocales(locales, defaultLocale)
                  .map((locale) => normalizeLocale(locale))
                  .join(', ')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(
  getServerSidePropsContext: GetServerSidePropsContext
): Promise<{ props: MulMessagesServerSideProps }> {
  const { req, locale, locales, defaultLocale } = getServerSidePropsContext;

  const actualLocales = getActualLocales(locales, defaultLocale);
  const actualDefaultLocale = getActualDefaultLocale(locales, defaultLocale);
  const cookies = Cookies.get(getServerSidePropsContext);
  let resolvedLocale = getActualLocale(locale, defaultLocale, locales);

  // When Next.js tries to use the default locale, try to find a better one.
  if (locale === defaultLocale) {
    // TODO: add a script that sets the NEXT_LOCALE cookie on initial page load (client-side)
    let cookieLocale = cookies['NEXT_LOCALE'];
    if (cookieLocale && !actualLocales.includes(cookieLocale)) {
      // Delete the cookie if the value is invalid (e.g. been tampered with).
      Cookies.destroy(getServerSidePropsContext, 'NEXT_LOCALE');
      cookieLocale = undefined;
    }

    resolvedLocale = cookieLocale
      ? cookieLocale
      : getPreferredLocale(
          req.headers['accept-language'],
          actualLocales,
          actualDefaultLocale
        ).toLowerCase();
  }

  const messages = (
    await import(`./index.${normalizeLocale(resolvedLocale)}.properties`)
  ).default as MulMessages;

  return {
    props: {
      messages,
      resolvedLocale
    }
  };
}
