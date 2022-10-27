import { Layout } from '@/components/layout/Layout'
import { NextPage } from 'next'
import Link from 'next-multilingual/link'
import { getTitle, useMessages } from 'next-multilingual/messages'

const Error500: NextPage = () => {
  const messages = useMessages()
  const title = getTitle(messages)
  return (
    <Layout title={title}>
      <h1>{title}</h1>
      <Link href="/">{messages.format('goBack')}</Link>
    </Layout>
  )
}

export default Error500
