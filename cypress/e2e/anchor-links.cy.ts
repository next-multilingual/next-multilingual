import { ACTUAL_LOCALES, BASE_PATH, LOCALE_NAMES, LocalizedConstant } from '../constants'

export const ANCHOR_LINK_TESTS_URLS: LocalizedConstant = {
  'en-US': '/tests/anchor-links',
  'fr-CA': '/tests/liens-internes',
}

export const ANCHOR_LINK_TEST_FRAGMENTS: LocalizedConstant = {
  'en-US': 'paragraph-3',
  'fr-CA': 'paragraphe-3',
}

export const LONG_PAGE_TEST_URLS: LocalizedConstant = {
  'en-US': `${ANCHOR_LINK_TESTS_URLS['en-US']}/long-page`,
  'fr-CA': `${ANCHOR_LINK_TESTS_URLS['fr-CA']}/page-longue`,
}

describe('An anchor link', () => {
  ACTUAL_LOCALES.forEach((locale) => {
    const localeName = LOCALE_NAMES[locale]
    const anchorLinkTestsUrl = `${BASE_PATH}/${locale.toLowerCase()}${
      ANCHOR_LINK_TESTS_URLS[locale]
    }`
    const longPageTestsUrl = `${BASE_PATH}/${locale.toLowerCase()}${LONG_PAGE_TEST_URLS[locale]}`
    const linkWithFragment = `${longPageTestsUrl}#${ANCHOR_LINK_TEST_FRAGMENTS[locale]}`

    it(`will have the correct SSR markup when using an anchor link for '${localeName}'`, () => {
      cy.request(anchorLinkTestsUrl).then((response) => {
        expect(response.body).to.contain(`<a href="${linkWithFragment}">`)
      })
    })

    it(`will have the correct client side href value when using an anchor link for '${localeName}'`, () => {
      cy.visit(anchorLinkTestsUrl)
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
