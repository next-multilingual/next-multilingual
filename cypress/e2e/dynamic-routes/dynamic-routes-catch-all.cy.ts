import { ACTUAL_LOCALES, BASE_PATH, LOCALE_NAMES, LocalizedConstant, ORIGIN } from '../../constants'
import {
  getAlternateLinkHrefFromSource,
  getCanonicalLinkHrefFromSource,
  getHrefByIdFromSource,
  getLanguageSwitcherHrefFromSource,
  getValueByIdFromSource,
  hrefByIdEqualsTo,
  valueByIdEqualsTo,
} from '../../utils'

export const DYNAMIC_ROUTE_URLS: LocalizedConstant = {
  'en-US': '/tests/dynamic-routes/catch-all',
  'fr-CA': '/tests/routes-dynamiques/attrape-tout',
}

export const CATEGORY_SEGMENT: LocalizedConstant = {
  'en-US': '/category',
  'fr-CA': '/catégorie',
}

export const CATEGORY_PARAMETER_SEGMENTS: LocalizedConstant = {
  'en-US': '/family/business',
  'fr-CA': '/famille/affaire',
}

export const COUNTRY_FIRST_PARAMETER: LocalizedConstant = {
  'en-US': '/united-states-of-america',
  'fr-CA': '/états-unis-d-amérique',
}

export const COUNTRY_SECOND_PARAMETER: LocalizedConstant = {
  'en-US': `/canada`,
  'fr-CA': `/canada`,
}

export const DYNAMIC_ROUTE_INDEX_URL: LocalizedConstant = {
  'en-US': `${BASE_PATH}/en-us${DYNAMIC_ROUTE_URLS['en-US']}`,
  'fr-CA': `${BASE_PATH}/fr-ca${DYNAMIC_ROUTE_URLS['fr-CA']}`,
}

export const CATEGORY_URL: LocalizedConstant = {
  'en-US': `${DYNAMIC_ROUTE_INDEX_URL['en-US']}${CATEGORY_SEGMENT['en-US']}`,
  'fr-CA': `${DYNAMIC_ROUTE_INDEX_URL['fr-CA']}${CATEGORY_SEGMENT['fr-CA']}`,
}

export const CATEGORY_URL_WITH_PARAMETERS: LocalizedConstant = {
  'en-US': `${CATEGORY_URL['en-US']}${CATEGORY_PARAMETER_SEGMENTS['en-US']}`,
  'fr-CA': `${CATEGORY_URL['fr-CA']}${CATEGORY_PARAMETER_SEGMENTS['fr-CA']}`,
}

export const COUNTRY_URL_SINGLE_PARAMETER: LocalizedConstant = {
  'en-US': `${DYNAMIC_ROUTE_INDEX_URL['en-US']}${COUNTRY_FIRST_PARAMETER['en-US']}`,
  'fr-CA': `${DYNAMIC_ROUTE_INDEX_URL['fr-CA']}${COUNTRY_FIRST_PARAMETER['fr-CA']}`,
}

export const COUNTRY_URL_TWO_PARAMETERS: LocalizedConstant = {
  'en-US': `${COUNTRY_URL_SINGLE_PARAMETER['en-US']}${COUNTRY_SECOND_PARAMETER['en-US']}`,
  'fr-CA': `${COUNTRY_URL_SINGLE_PARAMETER['fr-CA']}${COUNTRY_SECOND_PARAMETER['fr-CA']}`,
}

/**
 * Strip the base from a URL path if it's present.
 *
 * @param urlPath - A URL path.
 * @param basePath - The base path.
 *
 * @returns The URL path without the base path.
 */
export const stripBasePath = (urlPath: string, basePath: string): string => {
  if (urlPath.startsWith(basePath)) {
    return urlPath.slice(basePath.length)
  }
  return urlPath
}

describe('A catch-all dynamic route', () => {
  ACTUAL_LOCALES.forEach((locale) => {
    const localeName = LOCALE_NAMES[locale]
    const dynamicRouteIndexUrl = DYNAMIC_ROUTE_INDEX_URL[locale]
    const categoryUrl = CATEGORY_URL[locale]
    const categoryUrlWithParameters = CATEGORY_URL_WITH_PARAMETERS[locale]
    const countrySingleParameterUrl = COUNTRY_URL_SINGLE_PARAMETER[locale]
    const countryTwoParameterUrl = COUNTRY_URL_TWO_PARAMETERS[locale]

    let source: string

    // Tests on /tests/dynamic-routes/catch-all
    describe(`while navigating on "${dynamicRouteIndexUrl}" for '${localeName}'`, () => {
      describe(`has the correct localized SSR markup`, () => {
        it(`on a <Link> component when the target is a non-optional catch-all route`, () => {
          cy.request(dynamicRouteIndexUrl).then((response) => {
            source = response.body as string
            expect(getHrefByIdFromSource(source, 'category-link')).to.equal(categoryUrl)
          })
        })

        it(`on an hidden input using 'getLocalizedUrl' when the target is a non-optional catch-all route`, () => {
          expect(decodeURI(getValueByIdFromSource(source, 'category-hidden-input'))).to.equal(
            categoryUrl
          )
        })

        it(`on a <Link> component when the target is an optional catch-all route`, () => {
          expect(getHrefByIdFromSource(source, 'country-link')).to.equal(countrySingleParameterUrl)
        })

        it(`on an hidden input using 'getLocalizedUrl' when the target is an optional catch-all route`, () => {
          expect(decodeURI(getValueByIdFromSource(source, 'country-hidden-input'))).to.equal(
            countrySingleParameterUrl
          )
        })
      })

      describe(`has the correct localized client-side markup`, () => {
        it(`on a <Link> component when the target is a non-optional catch-all route`, () => {
          cy.visit(dynamicRouteIndexUrl)

          hrefByIdEqualsTo(cy, 'category-link', categoryUrl)
        })

        it(`on an hidden input using 'getLocalizedUrl' when the target is a non-optional catch-all route`, () => {
          valueByIdEqualsTo(cy, 'category-hidden-input', encodeURI(categoryUrl))
        })

        it(`on a <Link> component when the target is an optional catch-all route`, () => {
          hrefByIdEqualsTo(cy, 'country-link', countrySingleParameterUrl)
        })

        it(`on an hidden input using 'getLocalizedUrl' when the target is an optional catch-all route`, () => {
          valueByIdEqualsTo(cy, 'country-hidden-input', encodeURI(countrySingleParameterUrl))
        })

        it(`should have the correct URL when clicking on the category link`, () => {
          cy.get('#category-link').click()
          cy.url().should('eq', encodeURI(`${Cypress.config().baseUrl}${categoryUrl}`))
          cy.go('back')
        })

        it(`should have the correct URL when clicking on the category link`, () => {
          cy.get('#category-link').click()
          cy.url().should('eq', encodeURI(`${Cypress.config().baseUrl}${categoryUrl}`))
        })

        it(`should have the correct URL when clicking on the country link`, () => {
          cy.visit(dynamicRouteIndexUrl)
          cy.get('#country-link').click()
          cy.url().should(
            'eq',
            encodeURI(`${Cypress.config().baseUrl}${countrySingleParameterUrl}`)
          )
        })
      })
    })

    // Tests on /tests/dynamic-routes/catch-all/category (optional catch-all route)
    describe(`while navigating on "${categoryUrl}" for '${localeName}'`, () => {
      describe(`has the correct localized SSR markup`, () => {
        it(`on its canonical link when the target is an optional catch-all route index (no parameter)`, () => {
          cy.request(categoryUrl).then((response) => {
            source = response.body as string
            expect(getCanonicalLinkHrefFromSource(source)).to.equal(`${ORIGIN}${categoryUrl}`)
          })
        })

        const currentLocale = locale
        ACTUAL_LOCALES.forEach((locale) => {
          it(`on its '${locale}' alternate link when the target is an optional catch-all route index (no parameter)`, () => {
            expect(getAlternateLinkHrefFromSource(source, locale)).to.equal(
              `${ORIGIN}${CATEGORY_URL[locale]}`
            )
          })

          if (locale !== currentLocale) {
            it(`on its '${locale}' language switcher link when the target is an optional catch-all route (no parameter)`, () => {
              expect(getLanguageSwitcherHrefFromSource(source, locale)).to.equal(
                `${CATEGORY_URL[locale]}`
              )
            })
          }
        })
      })

      describe(`has the correct localized client-side markup`, () => {
        it(`on a <Link> component when the target is an optional catch-all route`, () => {
          cy.visit(categoryUrl)
          hrefByIdEqualsTo(cy, 'link-with-2-parameters', categoryUrlWithParameters)
        })

        it(`should have the correct URL when clicking on the link with 2 parameters when the target is an optional catch-all route`, () => {
          cy.get('#link-with-2-parameters').click()
          cy.url().should(
            'eq',
            encodeURI(`${Cypress.config().baseUrl}${categoryUrlWithParameters}`)
          )
        })
      })
    })

    // Tests on /tests/dynamic-routes/catch-all/category/family/business (optional catch-all route with 2 parameters)
    describe(`while navigating on "${categoryUrlWithParameters}" for '${localeName}'`, () => {
      describe(`has the correct localized SSR markup`, () => {
        it(`on its canonical link when the target is an optional catch-all route index with 2 parameters`, () => {
          cy.request(categoryUrlWithParameters).then((response) => {
            source = response.body as string
            expect(getCanonicalLinkHrefFromSource(source)).to.equal(
              `${ORIGIN}${categoryUrlWithParameters}`
            )
          })
        })

        const currentLocale = locale
        ACTUAL_LOCALES.forEach((locale) => {
          it(`on its '${locale}' alternate link when the target is an optional catch-all route index with 2 parameters`, () => {
            expect(getAlternateLinkHrefFromSource(source, locale)).to.equal(
              `${ORIGIN}${CATEGORY_URL_WITH_PARAMETERS[locale]}`
            )
          })

          if (locale !== currentLocale) {
            it(`on its '${locale}' language switcher link when the target is an optional catch-all route index with 2 parameters`, () => {
              expect(getLanguageSwitcherHrefFromSource(source, locale)).to.equal(
                `${CATEGORY_URL_WITH_PARAMETERS[locale]}`
              )
            })
          }
        })
      })

      describe(`has the correct localized client-side markup`, () => {
        it(`on a <Link> component when the target is an optional catch-all route with 2 parameters`, () => {
          cy.visit(categoryUrl)
          hrefByIdEqualsTo(cy, 'link-with-2-parameters', categoryUrlWithParameters)
        })

        it(`should have the correct URL when clicking on the link with 2 parameters when the target is a catch-all route`, () => {
          cy.get('#link-with-2-parameters').click()
          cy.url().should(
            'eq',
            encodeURI(`${Cypress.config().baseUrl}${categoryUrlWithParameters}`)
          )
        })
      })
    })

    // Tests on /tests/dynamic-routes/catch-all/united-states-of-america/canada (non-optional catch-all route with 2 parameters)
    describe(`while navigating on "${countryTwoParameterUrl}" for '${localeName}'`, () => {
      describe(`has the correct localized SSR markup`, () => {
        it(`on its canonical link when the target is a catch-all route index with 2 parameters`, () => {
          cy.request(countryTwoParameterUrl).then((response) => {
            source = response.body as string
            expect(getCanonicalLinkHrefFromSource(source)).to.equal(
              `${ORIGIN}${countryTwoParameterUrl}`
            )
          })
        })

        const currentLocale = locale
        ACTUAL_LOCALES.forEach((locale) => {
          it(`on its '${locale}' alternate link when the target is a catch-all route index with 2 parameters`, () => {
            expect(getAlternateLinkHrefFromSource(source, locale)).to.equal(
              `${ORIGIN}${COUNTRY_URL_TWO_PARAMETERS[locale]}`
            )
          })

          if (locale !== currentLocale) {
            it(`on its '${locale}' language switcher link when the target is a catch-all route index with 2 parameters`, () => {
              expect(getLanguageSwitcherHrefFromSource(source, locale)).to.equal(
                `${COUNTRY_URL_TWO_PARAMETERS[locale]}`
              )
            })
          }
        })
      })

      describe(`has the correct localized client-side markup`, () => {
        it(`on a <Link> component when the target is a catch-all route with 2 parameters`, () => {
          cy.visit(countryTwoParameterUrl)
          hrefByIdEqualsTo(cy, 'link-with-2-parameters', countryTwoParameterUrl)
        })

        it(`should have the correct URL when clicking on the link with 2 parameters when the target is a catch-all route`, () => {
          cy.get('#link-with-2-parameters').click()
          cy.url().should('eq', encodeURI(`${Cypress.config().baseUrl}${countryTwoParameterUrl}`))
        })
      })
    })
  })
})
