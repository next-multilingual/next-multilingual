import Layout from '@/layout'
import type { GetServerSideProps, NextPage } from 'next'
import { ResolvedLocaleServerSideProps, resolveLocale, useResolvedLocale } from 'next-multilingual'
import { getTitle, useMessages } from 'next-multilingual/messages'

const Home: NextPage<ResolvedLocaleServerSideProps> = ({ resolvedLocale }) => {
  // Force Next.js to use a locale that was resolved dynamically on the homepage.
  useResolvedLocale(resolvedLocale)

  // Load the messages in the correct locale.
  const messages = useMessages()

  return (
    <Layout title={getTitle(messages)}>
      <h1>{messages.format('headline')}</h1>
    </Layout>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps<ResolvedLocaleServerSideProps> = async (
  nextPageContext
) => {
  return {
    props: {
      resolvedLocale: resolveLocale(nextPageContext),
    },
  }
}
