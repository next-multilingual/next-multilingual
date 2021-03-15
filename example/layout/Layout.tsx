import { useRouter } from 'next/router';
import { ReactElement, ReactNode } from 'react';
import { IntlHead } from '../../lib/intl-head';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useCanonicalUrl } from '../../lib/hooks/useCanonicalUrl';

import styles from './Layout.module.css';

interface LayoutProps {
  title: string;
  children: ReactNode;
}

const Layout = ({ title, children }: LayoutProps): ReactElement => {
  const { locale } = useRouter();
  const canonicalUrl = useCanonicalUrl(locale);

  return (
    <div className={styles.container}>
      <IntlHead>
        <title>{title}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
        <link rel="canonical" href={canonicalUrl} />
      </IntlHead>
      <header className={styles.headerContainer}>
        <LanguageSwitcher />
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
