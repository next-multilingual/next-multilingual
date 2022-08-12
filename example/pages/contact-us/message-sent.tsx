import { NextPage } from 'next'
import { getTitle, useMessages } from 'next-multilingual/messages'

import Layout from '@/components/layout/Layout'

const MessageSent: NextPage = () => {
  const messages = useMessages()

  return (
    <Layout title={getTitle(messages)}>
      <h1>{messages.format('header')}</h1>
    </Layout>
  )
}

export default MessageSent
