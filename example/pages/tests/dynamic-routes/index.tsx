import { Layout } from '@/components/layout/Layout'
import { NextPage } from 'next'
import Link from 'next-multilingual/link'
import { getTitle, useMessages } from 'next-multilingual/messages'
import { useRouter } from 'next/router'
import styles from './index.module.css'

const DynamicRoutesTests: NextPage = () => {
  const messages = useMessages()
  const { pathname } = useRouter()
  const title = getTitle(messages)

  return (
    <Layout title={title}>
      <h1 className={styles.headline}>{title}</h1>
      <p>{messages.format('details')}</p>
      <p>{messages.format('intro')}</p>
      <ul>
        <li>
          <Link href={`${pathname}/identifier`}>{messages.format('test1')}</Link>
        </li>
        <li>
          <Link href={`${pathname}/text`}>{messages.format('test2')}</Link>
        </li>
      </ul>
    </Layout>
  )
}

export default DynamicRoutesTests
