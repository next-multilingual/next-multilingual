import { ACTUAL_LOCALES, BASE_PATH, LOCALE_NAMES } from '../constants'

export const ANCHOR_LINK_TESTS_URLS = {
  'en-US': '/tests/anchor-links',
  'fr-CA': '/tests/liens-internes',
}

export const ANCHOR_LINK_TEST_FRAGMENTS = {
  'en-US': 'paragraph-3',
  'fr-CA': 'paragraphe-3',
}

export const LONG_PAGE_TEST_URLS = {
  'en-US': `${ANCHOR_LINK_TESTS_URLS['en-US']}/long-page`,
  'fr-CA': `${ANCHOR_LINK_TESTS_URLS['fr-CA']}/page-longue`,
}

describe('An anchor link', () => {
  ACTUAL_LOCALES.forEach((locale) => {
    // Set localized variables
    const localizedAnchorLinkTestsUrl = ANCHOR_LINK_TESTS_URLS[locale] as string
    const localizedLongPageTestUrl = LONG_PAGE_TEST_URLS[locale] as string
    const localizedAnchorLinkTestFragment = ANCHOR_LINK_TEST_FRAGMENTS[locale] as string
    const localeName = LOCALE_NAMES[locale] as string
    const anchorLinkTestsUrl = `${BASE_PATH}/${locale.toLowerCase()}${localizedAnchorLinkTestsUrl}`
    const longPageTestsUrl = `${BASE_PATH}/${locale.toLowerCase()}${localizedLongPageTestUrl}`
    const linkWithFragment = `${longPageTestsUrl}#${localizedAnchorLinkTestFragment}`

    it(`will have the correct SSR markup when using an anchor link for '${localeName}'`, () => {
      cy.request({
        method: 'GET',
        url: anchorLinkTestsUrl,
        headers: {
          'Accept-Language': locale,
          Cookie: 'L=',
        },
      }).then((response) => {
        expect(response.body).to.contain(`<a href="${linkWithFragment}">`)
      })
    })

    it(`will have the correct client side href value when using an anchor link for '${localeName}'`, () => {
      cy.visit({
        url: anchorLinkTestsUrl,
        headers: {
          'Accept-Language': locale,
          Cookie: 'L=',
        },
      })
      cy.get('#anchor-link-test a')
        .should('have.attr', 'href')
        .then((href) => {
          expect(href).eq(linkWithFragment)
        })
    })

    it(`will redirect to the correct page and position when clicked for '${localeName}'`, () => {
      cy.get(`#anchor-link-test a`)
        .click({ timeout: 10000 })
        .then(() => {
          cy.url().should('eq', `${Cypress.config().baseUrl}${linkWithFragment}`)

          cy.window().then(($window) => {
            expect($window.scrollY).to.not.equal('0')
          })
        })
    })
  })
})
