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
    <Layout title={messages.title}>
      <h1 className={styles.headline}>{messages.title}</h1>
      <h2 className={styles.subHeader}>{messages.subHeader}</h2>
      <form onSubmit={handleSubmit}>
        <label className={styles.messageLabel} htmlFor="message">
          {messages.messageLabel}
        </label>
        <textarea
          className={styles.messageInput}
          id="message"
          name="message"
          placeholder={messages.messagePlaceholder}
        />
        <button className={styles.submitButton} type="submit">
          {messages.submitButton}
        </button>
      </form>
    </Layout>
  );
}
