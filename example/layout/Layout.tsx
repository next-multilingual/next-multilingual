import { IntlHead } from 'next-intl-router/lib/intl-head';
import { useRouter } from 'next/router';
import type { ReactElement, ReactNode } from 'react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Footer from './Footer';
import styles from './Layout.module.css';

interface LayoutProps {
  title: string;
  children: ReactNode;
}

const Layout = ({ title, children }: LayoutProps): ReactElement => {
  const { locale } = useRouter();
  const messages = require(`./layout.${locale}.properties`).default;

  return (
    <div className={styles.container}>
      <IntlHead>
        <title>{title}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </IntlHead>
      <header className={styles.headerContainer}>
        <div className={styles.headerMessage}>{messages.header}</div>
        <LanguageSwitcher />
      </header>
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
