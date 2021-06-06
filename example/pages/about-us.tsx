import { normalizeLocale } from 'next-multilingual';
import type { GetServerSidePropsContext, GetStaticProps } from 'next';
import type { ReactElement } from 'react';
import Layout from '../layout/Layout';
import type {
  MulMessages,
  MulMessagesStaticProps
} from 'next-multilingual/messages';

export default function AboutUs({
  messages
}: MulMessagesStaticProps): ReactElement {
  return (
    <Layout title={messages.title}>
      <h1>{messages.title}</h1>
      <p>{messages.details}</p>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({
  locale
}: GetServerSidePropsContext) => {
  const messages = (
    await import(`./about-us.${normalizeLocale(locale)}.properties`)
  ).default as MulMessages;

  return {
    props: {
      messages
    }
  };
};
