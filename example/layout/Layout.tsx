/* eslint @typescript-eslint/no-var-requires: "off" */
import { IntlHead } from 'next-intl-router/lib/intl-head';
import { useRouter } from 'next/router';
import type { ReactElement, ReactNode } from 'react';
import LanguagePicker from '../components/LanguagePicker';
import Footer from '../components/Footer';
import styles from './Layout.module.css';
import { IntlLink } from 'next-intl-router/lib/intl-link';

interface LayoutProps {
  title: string;
  children: ReactNode;
}

const Layout = ({ title, children }: LayoutProps): ReactElement => {
  const { locale } = useRouter();
  const messages = require(`./Layout.${locale}.properties`).default;

  return (
    <>
      <IntlHead>
        <title>{title}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </IntlHead>
      <header className={styles.header}>
        <div>
          <a href="/">{messages.header}</a>
        </div>
        <LanguagePicker />
        <nav className={styles.nav}>
          <IntlLink href="/">
            <a>{messages.home}</a>
          </IntlLink>
          <IntlLink href="/about-us">
            <a>{messages.aboutUs}</a>
          </IntlLink>
          <IntlLink href="/contact-us">
            <a>{messages.contactUs}</a>
          </IntlLink>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
