import {
  normalizeLocale,
  getActualLocales,
  getActualLocale,
  setCookieLocale
} from 'next-multilingual';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import Link from 'next-multilingual/link';
import { hydrateUrlQuery } from 'next-multilingual';
import styles from './LanguagePicker.module.css';

// Locales are not localized which is why it uses a JSON file.
import localeStrings from './localeStrings.json';

export default function LanguagePicker(): ReactElement {
  const { pathname, locale, locales, defaultLocale, query } = useRouter();
  const actualLocale = getActualLocale(locale, defaultLocale, locales);
  const actualLocales = getActualLocales(locales, defaultLocale);
  const href = hydrateUrlQuery(pathname, query);

  return (
    <div id="language-picker" className={styles.languagePicker}>
      <button>
        {localeStrings[normalizeLocale(actualLocale)]}
        <i></i>
      </button>
      <div>
        {actualLocales
          .filter((locale) => locale !== actualLocale)
          .map((locale) => {
            return (
              <Link key={locale} href={href} locale={locale}>
                <a
                  onClick={() => {
                    setCookieLocale(locale);
                  }}
                lang={normalizeLocale(locale)}>
                  {localeStrings[normalizeLocale(locale)]}
                </a>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
