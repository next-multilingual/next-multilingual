import type { GetServerSidePropsContext, GetStaticProps } from 'next';
import type { ReactElement } from 'react';
import Layout from '../layout/Layout';

export default function AboutUs({ messages }: Props): ReactElement {
  return (
    <Layout title={messages.title}>
      <h1>{messages.title}</h1>
      <p>{messages.details}</p>
    </Layout>
  );
}

type Messages = {
  [key: string]: string;
};

type Props = {
  messages: Messages;
};

export const getStaticProps: GetStaticProps = async ({
  locale
}: GetServerSidePropsContext) => {
  // const messages = (
  //   await import(`./${__filename.replace('.tsx', `${locale}.properties`)}`)
  // ).default as Messages;
  const messages = (await import(`./about-us.${locale}.properties`))
    .default as Messages;

  return {
    props: {
      messages
    }
  };
};
