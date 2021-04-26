import Cookies from 'nookies';
import {
  getSupportedLocales,
  getDefaultLocale
} from 'next-intl-router/lib/helpers/getLocalesDetails';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import resolveAcceptLanguage from 'resolve-accept-language';
import Layout from '../layout/Layout';
import type { Messages, ServerSideMessagesProps } from '../types/MessagesTypes';

export default function IndexPage({
  messages,
  currentLocale
}: ServerSideMessagesProps): ReactElement {
  const router = useRouter();
  router.locale = currentLocale; // Overwrite locale with the resolved locale.
  const { locales, defaultLocale, locale } = router;

  return (
    <Layout title={messages.title}>
      <h1>{messages.headline}</h1>
      <p>Router locale: {locale}</p>
      <p>Default locale: {defaultLocale}</p>
      <p>Configured locales: {JSON.stringify(locales)}</p>
      <br />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  getServerSidePropsContext: GetServerSidePropsContext
) => {
  const {
    req,
    locale,
    locales,
    defaultLocale: multilingual
  } = getServerSidePropsContext;

  const supportedLocales = getSupportedLocales(locales, multilingual);
  const defaultLocale = getDefaultLocale(supportedLocales);
  const cookies = Cookies.get(getServerSidePropsContext);
  let currentLocale = locale;

  if (locale === multilingual) {
    // TODO: add a script that sets NEXT_LOCALE on initial page load (client-side)
    let cookieLocale = cookies['NEXT_LOCALE'];
    if (cookieLocale && !supportedLocales.includes(cookieLocale)) {
      // Delete the cookie if the value is invalid (e.g. been tampered with).
      Cookies.destroy(getServerSidePropsContext, 'NEXT_LOCALE');
      cookieLocale = undefined;
    }

    currentLocale = cookieLocale
      ? cookieLocale
      : resolveAcceptLanguage(
          req.headers['accept-language'],
          supportedLocales,
          defaultLocale
        );
  }

  const messages = (await import(`./index.${currentLocale}.properties`))
    .default as Messages;

  return {
    props: {
      messages,
      currentLocale
    }
  };
};
