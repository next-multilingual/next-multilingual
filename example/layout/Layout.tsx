import { useRouter } from 'next/router';
import { ReactElement, ReactNode } from 'react';
import { IntlHead } from '../../lib/intl-head';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useCanonicalUrl } from '../hooks/useCanonicalUrl';

import styles from './Layout.module.css';

interface LayoutProps {
  title: string;
  children: ReactNode;
  currentLocale?: string;
}

const Layout = ({ title, children, currentLocale }: LayoutProps): ReactElement => {
  const { locales, locale } = useRouter();
  const canonicalUrl = useCanonicalUrl(locale);


  return (
    <div className={styles.container}>
      <IntlHead currentLocale={currentLocale}>
        <title>{title}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
        <link rel="canonical" href={canonicalUrl} />
      </IntlHead>
      <header className={styles.headerContainer}>
        <LanguageSwitcher locales={locales} />
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
