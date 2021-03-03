import accept from '@hapi/accept';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import { IntlLink } from '../../lib/intl-link';
import Layout from '../layout/Layout';

export default function IndexPage({ language }): ReactElement {
  const router = useRouter();
  const { locale, locales, defaultLocale } = router;

  return (
    <Layout title="Home Page" language={language}>
      <h1>Homepage</h1>
      <p>Current locale: {locale}</p>
      <p>Default locale: {defaultLocale}</p>
      <p>Configured locales: {JSON.stringify(locales)}</p>
      <br />
      <IntlLink href="/about-us" locale={locale}>
        <a>About us page</a>
      </IntlLink>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  locales,
  locale
}: GetServerSidePropsContext) => {
  const language = accept.language(req.headers['accept-language'], locales);

  return {
    props: {
      language: locale || language
    }
  };
};
