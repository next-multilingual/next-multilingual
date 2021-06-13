import Cookies from 'nookies';
import {
  getActualLocales,
  getActualDefaultLocale,
  normalizeLocale
} from 'next-multilingual';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import resolveAcceptLanguage from 'resolve-accept-language';
import Layout from '@/layout';
import type {
  MulMessages,
  MulMessagesServerSideProps
} from 'next-multilingual/messages';

export default function IndexPage({
  messages,
  currentLocale
}: MulMessagesServerSideProps): ReactElement {
  const router = useRouter();
  router.locale = currentLocale; // Overwrite locale with the resolved locale.
  const { locales, defaultLocale, locale } = router;
  console.dir(router, { depth: null });

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

  const actualLocales = getActualLocales(locales, multilingual);
  const actualDefaultLocale = getActualDefaultLocale(locales, multilingual);
  const cookies = Cookies.get(getServerSidePropsContext);
  let currentLocale = locale;

  if (locale === multilingual) {
    // TODO: add a script that sets NEXT_LOCALE on initial page load (client-side)
    let cookieLocale = cookies['NEXT_LOCALE'];
    if (cookieLocale && !actualLocales.includes(cookieLocale)) {
      // Delete the cookie if the value is invalid (e.g. been tampered with).
      Cookies.destroy(getServerSidePropsContext, 'NEXT_LOCALE');
      cookieLocale = undefined;
    }

    currentLocale = cookieLocale
      ? cookieLocale
      : resolveAcceptLanguage(
          req.headers['accept-language'],
          actualLocales,
          actualDefaultLocale
        ).toLowerCase();
  }

  const messages = (
    await import(`./index.${normalizeLocale(currentLocale)}.properties`)
  ).default as MulMessages;

  return {
    props: {
      messages,
      currentLocale
    }
  };
};
