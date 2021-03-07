import { useRouter } from 'next/router';
import { ReactElement, ReactNode } from 'react';
import { IntlHead } from '../../lib/intl-head';
import LanguageSwitcher from '../components/LanguageSwitcher';

import styles from './Layout.module.css';

interface LayoutProps {
  title: string;
  language?: string;
  children: ReactNode;
}

const Layout = ({ title, language, children }: LayoutProps): ReactElement => {
  const { locales } = useRouter();
  return (
    <div className={styles.container}>
      <IntlHead language={language}>
        <title>{title}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </IntlHead>
      <header className={styles.headerContainer}>
        <link rel="alternate" href="/" hrefLang="pt" />
        <LanguageSwitcher locales={locales} />
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
