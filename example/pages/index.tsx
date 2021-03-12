import cookie from 'cookie';
import accept from '@hapi/accept';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import { IntlLink } from '../../lib/intl-link';
import Layout from '../layout/Layout';

export default function IndexPage({ currentLocale }): ReactElement {
  const router = useRouter();
  const { locales, defaultLocale, locale } = router;

  return (
    <Layout title="Home Page" currentLocale={currentLocale}>
      <h1>Homepage</h1>
      <p>Router locale: {locale}</p>
      <p>Current locale: {currentLocale}</p>
      <p>Default locale: {defaultLocale}</p>
      <p>Configured locales: {JSON.stringify(locales)}</p>
      <br />
      <IntlLink href="/about-us">
        <a>About us page</a>
      </IntlLink>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  locales,
  locale,
  defaultLocale
}: GetServerSidePropsContext) => {
  const language = accept.language(req.headers['accept-language'], locales);
  const currentLocale = language.length ? language : defaultLocale;

  return {
    props: {
      currentLocale
    }
  };
};
