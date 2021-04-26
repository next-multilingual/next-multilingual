import {
  getSupportedLocales,
  getDefaultLocale
} from 'next-intl-router/lib/helpers/getLocalesDetails';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
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
    defaultLocale: multilingual
  } = useRouter();

  const supportedLocales = getSupportedLocales(locales, multilingual);
  const defaultLocale = getDefaultLocale(supportedLocales);

  return (
    <div className={styles.languagePicker}>
      <button>
        {localeStrings[currentLocale]}
        <i></i>
      </button>
      <div>
        {supportedLocales.filter((locale) => {
          if (locale !== currentLocale) {
            return (
              <IntlLink
                key={locale}
                href={locale === defaultLocale ? pathname : asPath}
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
          }
        })}
      </div>
    </div>
  );
};

export default LanguagePicker;
