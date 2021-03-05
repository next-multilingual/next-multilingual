import { ReactElement } from 'react';
import { IntlLink } from '../../lib/intl-link';

import styles from './LanguageSwitcher.module.css';

const LanguageSwitcher = ({ locales }: { locales: string[] }): ReactElement => (
  <ul className={styles.languageSwitcherContainer}>
    {locales
      .filter((l) => l !== 'catchAll')
      .map((locale) => (
        <li key={locale}>
          <IntlLink href="/" locale={locale}>
            {locale}
          </IntlLink>
        </li>
      ))}
  </ul>
);

export default LanguageSwitcher;
