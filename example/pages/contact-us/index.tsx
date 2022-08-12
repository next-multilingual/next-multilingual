import { NextPage } from 'next'
import { getTitle, useMessages } from 'next-multilingual/messages'
import { useRouter } from 'next/router'
import type { FormEvent } from 'react'

import Layout from '@/components/layout/Layout'

import styles from './index.module.css'

const ContactUs: NextPage = () => {
  const router = useRouter()
  const messages = useMessages()
  const title = getTitle(messages)

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault() // Don't redirect the page.
    void router.push('/contact-us/message-sent')
  }

  return (
    <Layout title={title}>
      <h1 className={styles.headline}>{title}</h1>
      <h2 className={styles.subHeader}>{messages.format('subHeader')}</h2>
      <form onSubmit={handleSubmit}>
        <label className={styles.messageLabel} htmlFor="message">
          {messages.format('messageLabel')}
        </label>
        <textarea
          className={styles.messageInput}
          id="message"
          name="message"
          placeholder={messages.format('messagePlaceholder')}
        />
        <button className={styles.submitButton} type="submit">
          {messages.format('submitButton')}
        </button>
      </form>
    </Layout>
  )
}

export default ContactUs
