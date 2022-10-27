import { normalizeLocale, setCookieLocale } from 'next-multilingual'
import Link from 'next-multilingual/link'
import { KeyValueObject } from 'next-multilingual/messages'
import { LocalizedRouteParameters, useRouter } from 'next-multilingual/router'
import { getLanguageSwitcherUrl } from 'next-multilingual/url'
import { ReactElement, useState } from 'react'

import styles from './LanguageSwitcher.module.css'
// Locales are not localized which is why it uses a JSON file.
import localeStrings from './localeStrings.json'

type LanguageSwitcherProps = {
  /** Localized route parameters, if the page is using a dynamic route. */
  localizedRouteParameters?: LocalizedRouteParameters
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  localizedRouteParameters,
}): ReactElement => {
  const router = useRouter()
  const { locale: currentLocale, locales } = router
  const [isOver, setIsOver] = useState(false)
  const href = getLanguageSwitcherUrl(router, localizedRouteParameters)

  return (
    <div
      id="language-switcher"
      className={styles.languageSwitcher}
      onMouseOver={() => setIsOver(true)}
      onMouseOut={() => setIsOver(false)}
    >
      <button>
        {(localeStrings as KeyValueObject)[normalizeLocale(currentLocale)]}
        <i></i>
      </button>
      <div className={isOver ? styles.over : ''}>
        {locales
          .filter((locale) => locale !== currentLocale)
          .map((locale) => (
            <Link
              key={locale}
              href={href}
              locale={locale}
              localizedRouteParameters={localizedRouteParameters}
              data-cy="language-switcher-link"
              onClick={() => {
                setCookieLocale(locale)
              }}
              lang={normalizeLocale(locale)}
            >
              {(localeStrings as KeyValueObject)[normalizeLocale(locale)]}
            </Link>
          ))}
      </div>
    </div>
  )
}
