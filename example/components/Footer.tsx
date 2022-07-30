import { useMessages } from 'next-multilingual/messages'

import styles from './Footer.module.css'

export default function Footer(): JSX.Element {
  const messages = useMessages()
  return <footer className={styles.footer}>{messages.format('footerMessage')}</footer>
}
