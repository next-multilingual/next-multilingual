import accept from '@hapi/accept';
import Layout from '../layout/Layout';
import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType
} from 'next';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { IntlLink } from '../../lib/intl-link';

export default function IndexPage({
  language
}: InferGetServerSidePropsType<typeof getServerSideProps>): ReactElement {
  const { locales, defaultLocale } = useRouter();

  return (
    <Layout title="Home Page" language={language}>
      <h1>Homepage</h1>
      <p>Current locale: {language}</p>
      <p>Default locale: {defaultLocale}</p>
      <p>Configured locales: {JSON.stringify(locales)}</p>
      <IntlLink href="/" locale="en-CA">
        <a>[en-CA]</a>
      </IntlLink>{' '}
      <IntlLink href="/" locale="fr-CA">
        <a>[fr-CA]</a>
      </IntlLink>
      <br />
      <br />
      <IntlLink href="/about-us" locale={language}>
        <a>About us page</a>
      </IntlLink>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  locales
}: GetServerSidePropsContext) => {
  const language = accept.language(req.headers['accept-language'], locales);

  return {
    props: {
      language
    }
  };
};
