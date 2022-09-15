import { getActualLocales, normalizeLocale, setCookieLocale } from 'next-multilingual'
import Link from 'next-multilingual/link'
import { KeyValueObject } from 'next-multilingual/messages'
import { LocalizedRouteParameters, useRouter } from 'next-multilingual/router'
import { ReactElement, useState } from 'react'

import styles from './LanguagePicker.module.css'
// Locales are not localized which is why it uses a JSON file.
import localeStrings from './localeStrings.json'

type LanguagePickerProps = {
  /** Route parameters, if the page is using a dynamic route. */
  localizedRouteParameters?: LocalizedRouteParameters
}

export const LanguagePicker: React.FC<LanguagePickerProps> = ({
  localizedRouteParameters,
}): ReactElement => {
  const { pathname, locale, locales, defaultLocale, query } = useRouter()
  const actualLocales = getActualLocales(locales, defaultLocale)

  const [isOver, setIsOver] = useState(false)

  return (
    <div
      id="language-picker"
      className={styles.languagePicker}
      onMouseOver={() => setIsOver(true)}
      onMouseOut={() => setIsOver(false)}
    >
      <button>
        {(localeStrings as KeyValueObject)[normalizeLocale(locale)]}
        <i></i>
      </button>
      <div className={isOver ? styles.over : ''}>
        {actualLocales
          .filter((actualLocale) => actualLocale !== locale)
          .map((locale) => {
            const parameters =
              (localizedRouteParameters && localizedRouteParameters[locale]) ?? query
            return (
              <Link key={locale} href={{ pathname, query: parameters }} locale={locale}>
                <a
                  onClick={() => {
                    setCookieLocale(locale)
                  }}
                  lang={normalizeLocale(locale)}
                >
                  {(localeStrings as KeyValueObject)[normalizeLocale(locale)]}
                </a>
              </Link>
            )
          })}
      </div>
    </div>
  )
}
