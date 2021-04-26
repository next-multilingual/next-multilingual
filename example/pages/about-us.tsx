import type { GetServerSidePropsContext, GetStaticProps } from 'next';
import type { ReactElement } from 'react';
import Layout from '../layout/Layout';
import type { Messages, StaticMessagesProps } from '../types/MessagesTypes';

export default function AboutUs({
  messages
}: StaticMessagesProps): ReactElement {
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
  // TODO: check if there is a way to find the file name automatically - e.g. import(`./${__filename.replace('.tsx', `${locale}.properties`)}`)
  const messages = (await import(`./about-us.${locale}.properties`))
    .default as Messages;

  return {
    props: {
      messages
    }
  };
};
