import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import resolveAcceptLanguage from 'resolve-accept-language';
import { IntlLink } from '../../lib/intl-link';
import Layout from '../layout/Layout';

export default function IndexPage({
  currentLocale
}: {
  currentLocale: string;
}): ReactElement {
  const router = useRouter();
  const { locales, defaultLocale, locale } = router;

  return (
    <Layout title="Home Page">
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
  defaultLocale
}: GetServerSidePropsContext) => {
  const currentLocale = resolveAcceptLanguage(
    req.headers['accept-language'],
    locales,
    defaultLocale
  );

  return {
    props: {
      currentLocale
    }
  };
};
