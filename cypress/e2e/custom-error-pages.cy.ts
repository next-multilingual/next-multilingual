import {
  ACTUAL_DEFAULT_LOCALE,
  BASE_PATH,
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_NAMES,
  LocalizedConstant,
} from '../constants'

export const NOT_FOUND_URLS: LocalizedConstant = {
  'en-US': '/does-not-exist',
  'fr-CA': '/n-existe-pas',
}

export const SERVER_SIDE_404_URLS: LocalizedConstant = {
  'en-US': '/tests/custom-error-page?error=404',
  'fr-CA': '/tests/page-d-erreur-personnalis%C3%A9e?error=404',
}

export const SERVER_SIDE_500_URLS: LocalizedConstant = {
  'en-US': '/tests/custom-error-page?error=500',
  'fr-CA': '/tests/page-d-erreur-personnalis%C3%A9e?error=500',
}

export const ERROR_404_TEXT: LocalizedConstant = {
  'en-US': '404 - Page Not Found',
  'fr-CA': '404 - Page non trouvée',
}

export const ERROR_500_TEXT: LocalizedConstant = {
  'en-US': '500 - Internal server error',
  'fr-CA': '500 - Erreur interne du serveur',
}

describe('A custom error', () => {
  LOCALES.forEach((locale) => {
    const localeName = LOCALE_NAMES[locale]
    // If the default locale is being checked, expect the same result as the actual default locale.
    locale = locale === DEFAULT_LOCALE ? ACTUAL_DEFAULT_LOCALE : locale

    const notFoundUrl = `${BASE_PATH}/${locale.toLowerCase()}${NOT_FOUND_URLS[locale]}`
    const serverSide404Url = `${BASE_PATH}/${locale.toLowerCase()}${SERVER_SIDE_404_URLS[locale]}`
    const serverSide500Url = `${BASE_PATH}/${locale.toLowerCase()}${SERVER_SIDE_500_URLS[locale]}`
    const error404Text = ERROR_404_TEXT[locale]
    const error500Text = ERROR_500_TEXT[locale]

    describe(`for '${localeName}'`, () => {
      it(`will have the correct SSR markup when trying to access a URL that does not exist (404)`, () => {
        cy.request({
          url: notFoundUrl,
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.body).to.contain(error404Text)
        })
      })

      it(`will be displayed correctly (client-side) when trying to access a URL that does not exist (404)'`, () => {
        cy.visit({
          url: notFoundUrl,
          failOnStatusCode: false,
        })
        cy.contains(error404Text)
      })

      it('will have the correct SSR markup when a 404 is triggered by `getServerSideProps`', () => {
        cy.request({
          url: serverSide404Url,
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.body).to.contain(error404Text)
        })
      })

      it('will be displayed correctly (client-side) when a 404 is triggered by `getServerSideProps`', () => {
        cy.visit({
          url: serverSide404Url,
          failOnStatusCode: false,
        })
        cy.contains(error404Text)
      })

      if (Cypress.env('isProd')) {
        it('will have the correct SSR markup when a 500 is triggered by `getServerSideProps`', () => {
          cy.request({
            url: serverSide500Url,
            failOnStatusCode: false,
          }).then((response) => {
            expect(response.body).to.contain(error500Text)
          })
        })
        it('will be displayed correctly (client-side) when a 500 is triggered by `getServerSideProps`', () => {
          cy.visit({
            url: serverSide500Url,
            failOnStatusCode: false,
          })
          cy.contains(error500Text)
        })
      }
    })
  })
})
