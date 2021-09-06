import type { ReactElement, FormEvent } from 'react';
import Layout from '@/layout';
import { useMessages } from 'next-multilingual/messages';
import { useRouter } from 'next/router';
import styles from './index.module.css';

export default function ContactUs(): ReactElement {
  const router = useRouter();
  const messages = useMessages();

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault(); // Don't redirect the page.
    router.push('/contact-us/message-sent');
  }

  return (
    <Layout title={messages.format('pageTitle')}>
      <h1 className={styles.headline}>{messages.format('pageTitle')}</h1>
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
  );
}
