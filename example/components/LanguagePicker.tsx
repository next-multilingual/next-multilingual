/* eslint @typescript-eslint/no-var-requires: "off" */
import {
  getActualLocales,
  getActualDefaultLocale
} from 'next-intl-router/lib/helpers/getLocalesDetails';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { IntlLink } from 'next-intl-router/lib/intl-link';
import localeStrings from './localeStrings.json';
import styles from './LanguagePicker.module.css';
import { setCookie } from 'nookies';

function handleClick(value: string): void {
  setCookie(null, 'NEXT_LOCALE', value, {
    maxAge: 60 * 60 * 24 * 365 * 10
  });
}

const LanguagePicker = (): ReactElement => {
  const {
    asPath,
    pathname,
    locale: currentLocale,
    locales,
    defaultLocale
  } = useRouter();

  const actualLocales = getActualLocales(locales, defaultLocale);
  const actualDefaultLocale = getActualDefaultLocale(locales, defaultLocale);

  return (
    <div className={styles.languagePicker}>
      <button>
        {localeStrings[currentLocale]}
        <i></i>
      </button>
      <div>
        {actualLocales
          .filter((locale) => locale !== currentLocale)
          .map((locale) => {
            return (
              <IntlLink
                key={locale}
                href={locale === actualDefaultLocale ? pathname : asPath}
                locale={locale}
              >
                <a
                  onClick={() => {
                    handleClick(locale);
                  }}
                  suppressHydrationWarning={true}
                >
                  {localeStrings[locale]}
                </a>
              </IntlLink>
            );
          })}
      </div>
    </div>
  );
};

export default LanguagePicker;
