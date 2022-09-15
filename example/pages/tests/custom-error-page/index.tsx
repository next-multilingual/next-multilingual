import { Layout } from '@/components/layout/Layout'
import type { GetServerSideProps } from 'next'
import { NextPage } from 'next'
import { getTitle, useMessages } from 'next-multilingual/messages'

const CustomErrorPageTests: NextPage = () => {
  const messages = useMessages()
  const title = getTitle(messages)

  return (
    <Layout title={title}>
      <h1>{title}</h1>
      <p>{messages.format('details')}</p>
    </Layout>
  )
}

export default CustomErrorPageTests

export const getServerSideProps: GetServerSideProps = async (
  nextPageContext
  // eslint-disable-next-line @typescript-eslint/require-await
) => {
  // Simulate an internal server error.
  if (nextPageContext.query.error === '500') {
    throw new Error('internal server error')
  }

  // Simulate a page not found.
  if (nextPageContext.query.error === '404') {
    return {
      notFound: true,
    }
  }

  return {
    props: {},
  }
}
