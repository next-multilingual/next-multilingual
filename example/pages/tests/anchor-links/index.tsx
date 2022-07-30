import { NextPage } from 'next'
import Link from 'next-multilingual/link'
import { getTitle, slugify, useMessages } from 'next-multilingual/messages'
import { useRouter } from 'next/router'

import Layout from '@/layout'

import { useLongPageMessages } from './long-page'

const AnchorLinks: NextPage = () => {
  const messages = useMessages()
  const title = getTitle(messages)
  const { locale, pathname } = useRouter()
  const longPageMessages = useLongPageMessages()

  return (
    <Layout title={title}>
      <h1>{title}</h1>
      <div id="anchor-link-test">
        <Link
          href={`${pathname}/long-page#${slugify(longPageMessages.format('p3Header'), locale)}`}
        >
          {messages.format('linkAction')}
        </Link>
      </div>
    </Layout>
  )
}

export default AnchorLinks
