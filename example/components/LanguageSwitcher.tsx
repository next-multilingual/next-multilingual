import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import { IntlLink } from '../../lib/intl-link';

import styles from './LanguageSwitcher.module.css';

const LanguageSwitcher = (): ReactElement => {
  const { asPath, pathname, defaultLocale, locales } = useRouter();
  return (
    <ul className={styles.languageSwitcherContainer}>
      {locales.map((locale) => {
        return (
          <li key={locale}>
            <IntlLink
              href={locale === defaultLocale ? pathname : asPath}
              locale={locale}
            >
              {locale}
            </IntlLink>
          </li>
        );
      })}
    </ul>
  );
};

export default LanguageSwitcher;
