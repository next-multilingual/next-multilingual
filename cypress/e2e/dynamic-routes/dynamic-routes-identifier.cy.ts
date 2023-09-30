import { ACTUAL_LOCALES, BASE_PATH, LOCALE_NAMES, LocalizedConstant, ORIGIN } from '../../constants'

export const DYNAMIC_ROUTE_URLS: LocalizedConstant = {
  'en-US': '/tests/dynamic-routes/identifier',
  'fr-CA': '/tests/routes-dynamiques/identifiant',
}

describe('A dynamic route using a unique number (non-localizable) as parameters', () => {
  ACTUAL_LOCALES.forEach((locale) => {
    const localeName = LOCALE_NAMES[locale]
    const dynamicRouteIndexUrl = `${BASE_PATH}/${locale.toLowerCase()}${DYNAMIC_ROUTE_URLS[locale]}`

    let source: string
    let parameterValue: string
    let dynamicRouteUrl: string
    let canonicalDynamicRouteUrl: string

    // Localized <Link> (SSR)
    it(`has the correct localized link (SSR) markup for '${localeName}'`, () => {
      const inputMarkupRegExp = /.*(?<input><.*parameter-input.*?>)/
      const inputValueRegExp = /value=["'](?<parameterValue>.*?)["']/
      const linkMarkupRegExp = /.*(?<link><.*link-with-parameter.*?>)/
      const linkHrefRegExp = /href=["'](?<href>.*?)["']/

      cy.request(dynamicRouteIndexUrl).then((response) => {
        const source = response.body as string
        expect(source).to.match(inputMarkupRegExp)
        const inputMarkup = source.match(inputMarkupRegExp).groups['input']
        expect(inputMarkup).to.match(inputValueRegExp)
        parameterValue = inputMarkup.match(inputValueRegExp).groups['parameterValue']
        dynamicRouteUrl = `${dynamicRouteIndexUrl}/${parameterValue}`
        canonicalDynamicRouteUrl = `${dynamicRouteIndexUrl}/${parameterValue}`
        expect(source).to.match(linkMarkupRegExp)
        const linkInputMarkup = source.match(linkMarkupRegExp).groups['link']
        expect(linkInputMarkup).to.match(linkHrefRegExp)
        const linkHref = linkInputMarkup.match(linkHrefRegExp).groups['href']
        expect(linkHref).to.equal(dynamicRouteUrl)
      })
    })

    // Localized <Link> (client-side)
    it(`has the correct localized link (client-side) markup for '${localeName}'`, () => {
      cy.visit(dynamicRouteIndexUrl)
      cy.get(`#parameter-input`)
        .invoke('val')
        .then((value) => {
          expect(value).to.exist
          const parameterInputValue = value as string
          cy.get(`#link-with-parameter`)
            .invoke('attr', 'href')
            .then((href) => {
              expect(href).to.exist
              expect(href).to.equal(`${dynamicRouteIndexUrl}/${parameterInputValue}`)
              expect(href).to.equal(dynamicRouteUrl) // Test with the SSR value to make sure it matches.
            })
        })
    })

    // Localized <Link> click() (client-side)
    it(`has the correct URL when clicking (client-side) on a <Link> component for '${localeName}'`, () => {
      cy.get(`#link-with-parameter`).click()
      cy.waitUntil(() => cy.url().should('eq', `${Cypress.config().baseUrl}${dynamicRouteUrl}`), {
        errorMsg: 'Could not find the correct URL',
        timeout: Cypress.config('defaultCommandTimeout'),
        interval: 50,
      })
    })

    // `useLocalizedUrl` (client-side)
    it(`has the correct URL when using (client-side) the 'useLocalizedUrl' hook for '${localeName}'`, () => {
      cy.get(`#go-back a`).click()
      cy.get(`#parameter-input`).invoke('val').should('not.be.empty')
      cy.get(`#route-push-button`).click()
      cy.url().should('eq', `${Cypress.config().baseUrl}${dynamicRouteUrl}`)
    })

    // Localized Canonical <Head> link (SSR)
    it(`has the correct 'canonical' <Head> link (SSR) markup for '${localeName}'`, () => {
      cy.request(dynamicRouteUrl).then((response) => {
        source = response.body as string // Save it for the next test to avoid multiple calls.
        const canonicalLinkMarkup = `<link rel="canonical" href="${ORIGIN}${canonicalDynamicRouteUrl}"/>`
        expect(source).to.contain(canonicalLinkMarkup)
      })
    })

    // Localized Alternate <Head> link (SSR)
    it(`has the correct 'alternate' <Head> links (SSR) markup for '${localeName}'`, () => {
      ACTUAL_LOCALES.forEach((locale) => {
        const localizedDynamicRouteUrl = DYNAMIC_ROUTE_URLS[locale]
        const alternateLinkHref = `${BASE_PATH}/${locale.toLowerCase()}${localizedDynamicRouteUrl}/${parameterValue}`
        const alternateLinkMarkup = `<link rel="alternate" href="${ORIGIN}${alternateLinkHref}" hrefLang="${locale}"/>`
        expect(source).to.contain(alternateLinkMarkup)
      })
    })

    // Localized Canonical <Head> link (client-side)
    it(`has the correct 'canonical' <Head> link (client-side) markup for '${localeName}'`, () => {
      cy.visit(dynamicRouteUrl)
      cy.get(`head link[rel=canonical]`).should(
        'have.attr',
        'href',
        `${ORIGIN}${canonicalDynamicRouteUrl}`
      )
    })

    // Localized Alternate <Head> link (client-side)
    it(`has the correct 'alternate' <Head> links (client-side) markup for '${localeName}'`, () => {
      ACTUAL_LOCALES.forEach((locale) => {
        const localizedDynamicRouteUrl = DYNAMIC_ROUTE_URLS[locale]
        cy.get(`head link[rel=alternate][hreflang=${locale}]`).should(
          'have.attr',
          'href',
          `${ORIGIN}${BASE_PATH}/${locale.toLowerCase()}${localizedDynamicRouteUrl}/${parameterValue}`
        )
      })
    })

    const otherLocales = ACTUAL_LOCALES.filter((otherLocale) => otherLocale != locale)

    // Language switcher (client-side)
    it(`has the correct language switcher links (client-side) markup for '${localeName}'`, () => {
      otherLocales.forEach((otherLocale) => {
        const otherLocalizedRouteUrl = DYNAMIC_ROUTE_URLS[otherLocale]
        cy.get(`#language-switcher a[lang=${otherLocale}]`)
          .should('have.attr', 'href')
          .then((href) => {
            expect(href).eq(
              `${BASE_PATH}/${otherLocale.toLowerCase()}${otherLocalizedRouteUrl}/${parameterValue}`
            )
          })
      })
    })

    // Link after picking another language (client-side)
    const otherLocale = otherLocales[0]
    const otherLocaleName = LOCALE_NAMES[otherLocale]
    const otherLocalizedRouteUrl = DYNAMIC_ROUTE_URLS[otherLocale]

    it(`has the correct '<Link>' value when picking another language (${otherLocaleName}) (client-side) for '${localeName}'`, () => {
      cy.get(`#language-switcher`).trigger('mouseover')
      cy.get(`#language-switcher a[lang=${otherLocale}]`).should('be.visible')
      cy.get(`#language-switcher a[lang=${otherLocale}]`).click()
      cy.get(`#language-switcher`).trigger('mouseout')
      cy.get(`#go-back a`)
        .should('have.attr', 'href')
        .should('eq', `${BASE_PATH}/${otherLocale.toLowerCase()}${otherLocalizedRouteUrl}`)
    })
  })
})
