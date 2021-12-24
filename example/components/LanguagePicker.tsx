import {
    getActualLocale, getActualLocales, normalizeLocale, setCookieLocale
} from 'next-multilingual';
import Link from 'next-multilingual/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import styles from './LanguagePicker.module.css';
// Locales are not localized which is why it uses a JSON file.
import localeStrings from './localeStrings.json';

export default function LanguagePicker(): JSX.Element {
  const { pathname, locale, locales, defaultLocale, query } = useRouter();
  const actualLocale = getActualLocale(locale, defaultLocale, locales);
  const actualLocales = getActualLocales(locales, defaultLocale);

  const [isOver, setIsOver] = useState(false);

  return (
    <div
      id="language-picker"
      className={styles.languagePicker}
      onMouseOver={() => setIsOver(true)}
      onMouseOut={() => setIsOver(false)}
    >
      <button>
        {localeStrings[normalizeLocale(actualLocale)]}
        <i></i>
      </button>
      <div className={isOver ? styles.over : ''}>
        {actualLocales
          .filter((locale) => locale !== actualLocale)
          .map((locale) => {
            return (
              <Link key={locale} href={{ pathname, query }} locale={locale}>
                <a
                  onClick={() => {
                    setCookieLocale(locale);
                  }}
                  lang={normalizeLocale(locale)}
                >
                  {localeStrings[normalizeLocale(locale)]}
                </a>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
