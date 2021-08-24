import {
  normalizeLocale,
  getActualLocales,
  getActualLocale,
  setCookieLocale
} from 'next-multilingual';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { MulLink } from 'next-multilingual/link';
import localeStrings from './localeStrings.json';
import styles from './LanguagePicker.module.css';

export default function LanguagePicker(): ReactElement {
  const { pathname, locale, locales, defaultLocale } = useRouter();
  const actualLocale = getActualLocale(locale, defaultLocale, locales);
  const actualLocales = getActualLocales(locales, defaultLocale);

  return (
    <div className={styles.languagePicker}>
      <button>
        {localeStrings[normalizeLocale(actualLocale)]}
        <i></i>
      </button>
      <div>
        {actualLocales
          .filter((locale) => locale !== actualLocale)
          .map((locale) => {
            return (
              <MulLink key={locale} href={pathname} locale={locale}>
                <a
                  onClick={() => {
                    setCookieLocale(locale);
                  }}
                >
                  {localeStrings[normalizeLocale(locale)]}
                </a>
              </MulLink>
            );
          })}
      </div>
    </div>
  );
}
