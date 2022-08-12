import { NextPage } from 'next'
import { getTitle, useMessages } from 'next-multilingual/messages'

import Layout from '@/components/layout/Layout'

import styles from './index.module.css'

const AboutUs: NextPage = () => {
  const messages = useMessages()
  const title = getTitle(messages)

  return (
    <Layout title={title}>
      <h1 className={styles.headline}>{title}</h1>
      <p>{messages.format('details')}</p>
    </Layout>
  )
}

export default AboutUs
