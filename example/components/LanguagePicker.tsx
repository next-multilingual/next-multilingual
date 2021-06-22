import {
  normalizeLocale,
  getActualLocales,
  getActualDefaultLocale,
  getActualLocale
} from 'next-multilingual';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { MulLink } from 'next-multilingual/link';
import localeStrings from './localeStrings.json';
import styles from './LanguagePicker.module.css';
import { setCookie } from 'nookies';

function handleClick(value: string): void {
  setCookie(null, 'NEXT_LOCALE', value, {
    maxAge: 60 * 60 * 24 * 365 * 10
  });
}

const LanguagePicker = (): ReactElement => {
  const { asPath, pathname, locale, locales, defaultLocale } = useRouter();

  const actualLocale = getActualLocale(locale, defaultLocale, locales);
  const actualLocales = getActualLocales(locales, defaultLocale);
  const actualDefaultLocale = getActualDefaultLocale(locales, defaultLocale);

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
              <MulLink
                key={locale}
                href={locale === actualDefaultLocale ? pathname : asPath}
                locale={locale}
              >
                <a
                  onClick={() => {
                    handleClick(locale);
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
};

export default LanguagePicker;
