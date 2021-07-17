import { MulHead } from 'next-multilingual/head';
import type { ReactElement, ReactNode } from 'react';
import LanguagePicker from '@/components/LanguagePicker';
import Footer from '@/components/Footer';
import styles from './Layout.module.css';
import { MulLink } from 'next-multilingual/link';
import { useMessages } from 'next-multilingual/messages';

type LayoutProps = {
  /** The title of the page. */
  title: string;
  children: ReactNode;
};

/**
 * Component used for the general layout of a page.
 *
 * @param title - The title of the page.
 */
export default function Layout({ title, children }: LayoutProps): ReactElement {
  const messages = useMessages();
  return (
    <>
      <MulHead>
        <title>{title}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        ></meta>
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
}
