import {
  ACTUAL_LOCALES,
  BASE_PATH,
  LOCALE_NAMES,
  LocalizedConstantObject,
  ORIGIN,
} from '../../constants'
import { getMessages, slugify } from '../../utils'

const DEFAULT_CITY = 'london'
const DEFAULT_POI = 'palaceOfWestminster'

/**
 * Get the file path for the city messages.
 *
 * @param locale - The locale of the test.
 *
 * @returns The file path for the city messages.
 */
const getCityMessagesFilePath = (locale: string): string =>
  `example/src/messages/cities/citiesMessages.${locale}.properties`

/** Point of interest by city and by locale. */
type LocalizedPoi = {
  [locale: string]: {
    [city: string]: {
      [poi: string]: string
    }
  }
}
/**
 * Get the file path for the city messages.
 *
 * @param locale - The locale of the test.
 *
 * @returns The file path for the city messages.
 */
const getPoiMessagesFilePath = (locale: string, city = DEFAULT_CITY): string => {
  return `example/src/messages/cities/points-of-interest/${city}PoiMessages.${locale}.properties`
}

/** City messages by locale. */
const CITY_MESSAGES: LocalizedConstantObject = {}
/** Point of interest messages by locale and city. */
const POI_MESSAGES: LocalizedPoi = {}

/**
 * Get a localized URL that includes the city.
 *
 * @param locale - The locale of the test.
 * @param city - The city of the test.
 *
 * @returns A localized city URL.
 */
const getCityUrl = (locale: string, city = DEFAULT_CITY): string =>
  encodeURI(
    `${BASE_PATH}/${locale.toLowerCase()}${
      locale === 'fr-CA'
        ? `/tests/routes-dynamiques/texte/${slugify(
            CITY_MESSAGES[locale][city],
            locale
          )}/point-d-intérêt`
        : `/tests/dynamic-routes/text/${slugify(
            CITY_MESSAGES[locale][city],
            locale
          )}/point-of-interest`
    }`
  )

/**
 * Get a localized URL that includes both the city and point of interest.
 *
 * @param locale - The locale of the test.
 * @param poi - The point of interest of the tes.
 * @param city - The city of the test.
 *
 * @returns A localized point of interest URL.
 */
const getPoiUrl = (locale: string, poi = DEFAULT_POI, city = DEFAULT_CITY): string =>
  encodeURI(
    decodeURI(`${getCityUrl(locale, city)}/${slugify(POI_MESSAGES[locale][city][poi], locale)}`)
  )

before(() => {
  // Create city constant.
  ACTUAL_LOCALES.forEach((locale) => {
    cy.readFile(getCityMessagesFilePath(locale))
      .then((content) => {
        CITY_MESSAGES[locale] = getMessages(content as string)
      })
      .then(() => {
        // Create point of interest constant.
        Object.entries(CITY_MESSAGES[locale]).forEach(([city]) => {
          cy.readFile(getPoiMessagesFilePath(locale, city)).then((content) => {
            POI_MESSAGES[locale] = POI_MESSAGES[locale] ?? {}
            POI_MESSAGES[locale][city] = getMessages(content as string)
          })
        })
      })
  })
})

describe('A dynamic route using localized text as parameters', () => {
  ACTUAL_LOCALES.forEach((locale) => {
    const localeName = LOCALE_NAMES[locale]

    let cityUrl: string
    let poiUrl: string
    let source: string
    let poiParameter: string
    let cityParameter: string

    // Localized SSR URL
    it(`has the correct localized SSR URL markup for '${localeName}'`, () => {
      // Assign values here to give a chance to `before()` to run.
      cityUrl = getCityUrl(locale)
      poiUrl = getPoiUrl(locale)
      cityParameter = slugify(CITY_MESSAGES[locale][DEFAULT_CITY], locale)
      poiParameter = slugify(POI_MESSAGES[locale][DEFAULT_CITY][DEFAULT_POI], locale)

      const urlPreviewRegExp = /.*(<.*url-preview.*?>)(?<urlPreview>.*?)<\/code>/
      const linkMarkupRegExp = /.*(?<link><.*link-with-parameter.*?>)/
      const linkHrefRegExp = /href=["'](?<href>.*?)["']/

      cy.request(decodeURI(cityUrl)).then((response) => {
        source = response.body as string
        // Check for the preview message URL.
        expect(source).to.match(urlPreviewRegExp)
        const urlPreview = `${BASE_PATH}${source.match(urlPreviewRegExp).groups['urlPreview']}`
        expect(urlPreview).to.equal(poiUrl)
        // Check for the anchor link URL.
        expect(source).to.match(linkMarkupRegExp)
        const linkMarkup = source.match(linkMarkupRegExp).groups['link']
        expect(linkMarkup).to.match(linkHrefRegExp)
        const linkHref = linkMarkup.match(linkHrefRegExp).groups['href']
        expect(linkHref).to.equal(poiUrl)
      })
    })

    // Localized client-side URL
    it(`has the correct localized client-side URL markup for '${localeName}'`, () => {
      cy.visit(decodeURI(cityUrl))
      cy.get(`#url-preview`)
        .invoke('text')
        .then((urlPreview) => {
          expect(`${BASE_PATH}${urlPreview}`).to.equal(poiUrl)
          cy.get(`#link-with-parameter`)
            .invoke('attr', 'href')
            .then((href) => {
              expect(href).to.exist
              expect(href).to.equal(poiUrl)
            })
        })
    })

    // Localized <Link> click() (client-side)
    it(`has the correct URL when clicking (client-side) on a <Link> component for '${localeName}'`, () => {
      cy.get(`#link-with-parameter`).click({ force: true, timeout: 10000 })
      cy.waitUntil(() => cy.url().should('eq', `${Cypress.config().baseUrl}${poiUrl}`), {
        errorMsg: 'Could not find the correct URL',
        timeout: Cypress.config('defaultCommandTimeout'),
        interval: 50,
      })
    })

    // `useLocalizedUrl` (client-side)
    it(`has the correct URL when using (client-side) the 'useLocalizedUrl' hook for '${localeName}'`, () => {
      cy.get(`#go-back a`).click()
      cy.get(`#route-push-button`).click()
      cy.url().should('eq', `${Cypress.config().baseUrl}${poiUrl}`)
    })

    // Localized parameters (SSR)
    it(`has the correct localized parameters (SSR) markup for '${localeName}'`, () => {
      const cityParameterRegExp = /.*(<.*city-parameter.*?>)(?<cityParameter>.*?)<\/td>/
      const poiParameterRegExp = /.*(<.*poi-parameter.*?>)(?<poiParameter>.*?)<\/td>/

      cy.request(poiUrl).then((response) => {
        source = response.body as string // Save it for the next test to avoid multiple calls.
        // Check city parameter.
        expect(source).to.match(cityParameterRegExp)
        const cityParameter = source.match(cityParameterRegExp).groups['cityParameter']
        expect(cityParameter).to.equal(cityParameter)
        // Check point of interest parameter.
        expect(source).to.match(poiParameterRegExp)
        const poiParameter = source.match(poiParameterRegExp).groups['poiParameter']
        expect(poiParameter).to.equal(poiParameter)
      })
    })

    // Localized Canonical <Head> link (SSR)
    it(`has the correct 'canonical' <Head> link (SSR) markup for '${localeName}'`, () => {
      const canonicalLinkMarkup = `<link rel="canonical" href="${ORIGIN}${getPoiUrl(locale)}"/>`
      expect(source).to.contain(canonicalLinkMarkup)
    })

    // Localized Alternate <Head> link (SSR)
    it(`has the correct 'alternate' <Head> links (SSR) markup for '${localeName}'`, () => {
      ACTUAL_LOCALES.forEach((locale) => {
        const alternateLinkMarkup = `<link rel="alternate" href="${ORIGIN}${getPoiUrl(
          locale
        )}" hrefLang="${locale}"/>`
        expect(source).to.contain(alternateLinkMarkup)
      })
    })

    // Localized parameters (client-side)
    it(`has the correct localized parameters (client-side) markup for '${localeName}'`, () => {
      cy.visit(poiUrl)
      cy.get(`#city-parameter`)
        .invoke('text')
        .then((text) => {
          expect(text).eq(cityParameter)
        })
      cy.get(`#poi-parameter`)
        .invoke('text')
        .then((text) => {
          expect(text).eq(poiParameter)
        })
    })

    // Localized Canonical <Head> link (client-side)
    it(`has the correct 'canonical' <Head> link (client-side) markup for '${localeName}'`, () => {
      cy.visit(poiUrl)
      cy.get(`head link[rel=canonical]`)
        .should('have.attr', 'href')
        .then((href) => {
          expect(href).eq(`${ORIGIN}${getPoiUrl(locale)}`)
        })
    })

    // Localized Alternate <Head> link (client-side)
    it(`has the correct 'alternate' <Head> links (client-side) markup for '${localeName}'`, () => {
      ACTUAL_LOCALES.forEach((locale) => {
        cy.get(`head link[rel=alternate][hreflang=${locale}]`)
          .should('have.attr', 'href')
          .then((href) => {
            expect(href).eq(`${ORIGIN}${getPoiUrl(locale)}`)
          })
      })
    })

    const otherLocales = ACTUAL_LOCALES.filter((otherLocale) => otherLocale != locale)

    // Language switcher (client-side)
    it(`has the correct language switcher links (client-side) markup for '${localeName}'`, () => {
      otherLocales.forEach((otherLocale) => {
        cy.get(`#language-switcher a[lang=${otherLocale}]`)
          .should('have.attr', 'href')
          .then((href) => {
            expect(href).eq(`${getPoiUrl(otherLocale)}`)
          })
      })
    })

    // Link after picking another language (client-side)
    const otherLocale = otherLocales[0]
    const otherLocaleName = LOCALE_NAMES[otherLocale]
    it(`has the correct '<Link>' value when picking another language (${otherLocaleName}) (client-side) for '${localeName}'`, () => {
      cy.get(`#language-switcher a[lang=${otherLocale}]`).as('languageSwitcher')
      cy.get('#language-switcher').trigger('mouseover')
      cy.get('@languageSwitcher').click({ force: true, timeout: 10000 })
      cy.get(`#go-back a`)
        .should('have.attr', 'href')
        .should('eq', `${getCityUrl(otherLocale)}`)
    })
  })
})
