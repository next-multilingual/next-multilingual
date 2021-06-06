import { MulHead } from 'next-multilingual/head';
import { useRouter } from 'next/router';
import type { ReactElement, ReactNode } from 'react';
import LanguagePicker from '../components/LanguagePicker';
import Footer from '../components/Footer';
import styles from './Layout.module.css';
import { MulLink } from 'next-multilingual/link';
import { normalizeLocale } from 'next-multilingual';
import { MulMessages } from 'next-multilingual/messages';

interface LayoutProps {
  title: string;
  children: ReactNode;
}

const Layout = ({ title, children }: LayoutProps): ReactElement => {
  const { locale } = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const messages = require(`./Layout.${normalizeLocale(locale)}.properties`)
    .default as MulMessages;

  return (
    <>
      <MulHead>
        <title>{title}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </MulHead>
      <header className={styles.header}>
        <div>
          <a href="/">{messages.header}</a>
        </div>
        <LanguagePicker />
        <nav className={styles.nav}>
          <MulLink href="/">
            <a>{messages.home}</a>
          </MulLink>
          <MulLink href="/about-us">
            <a>{messages.aboutUs}</a>
          </MulLink>
          <MulLink href="/contact-us">
            <a>{messages.contactUs}</a>
          </MulLink>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
