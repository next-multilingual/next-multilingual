import { useMessages } from 'next-multilingual/messages'

import styles from './Footer.module.css'

const Footer: React.FC = () => {
  const messages = useMessages()
  return <footer className={styles.footer}>{messages.format('footerMessage')}</footer>
}

export default Footer
