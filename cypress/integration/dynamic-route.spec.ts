import { DEFAULT_LOCALE, LOCALE_NAMES, LOCALES, ORIGIN } from '../constants';

export const DYNAMIC_ROUTE_URLS = {
  'en-US': '/dynamic-route-test',
  'fr-CA': '/test-de-route-dynamique',
};

describe('A dynamic route', () => {
  LOCALES.forEach((locale) => {
    const localeName = LOCALE_NAMES[locale];

    const dynamicRouteIndexUrl = `/${locale.toLowerCase()}${DYNAMIC_ROUTE_URLS[locale]}`;

    let source: string;
    let parameterValue: string;
    let dynamicRouteUrl: string;
    let canonicalDynamicRouteUrl: string;

    // Localized <Link> (SSR)
    it(`has the correct localized link (SSR) markup for '${localeName}'`, () => {
      const inputMarkupRegExp = /.*(?<input><.*parameter-input.*?>)/;
      const inputValueRegExp = /value=['"](?<parameterValue>.*?)['"]/;
      const linkMarkupRegExp = /.*(?<link><.*link-with-parameter.*?>)/;
      const linkHrefRegExp = /href=['"](?<href>.*?)['"]/;

      cy.request({
        method: 'GET',
        url: dynamicRouteIndexUrl,
        headers: {
          'Accept-Language': locale,
          Cookie: 'L=',
        },
      }).then(({ body: source }: Cypress.Response<string>) => {
        expect(source).to.match(inputMarkupRegExp);
        const inputMarkup = source.match(inputMarkupRegExp).groups['input'];
        expect(inputMarkup).to.match(inputValueRegExp);
        parameterValue = inputMarkup.match(inputValueRegExp).groups['parameterValue'];
        dynamicRouteUrl = `${dynamicRouteIndexUrl}/${parameterValue}`;
        canonicalDynamicRouteUrl = `/${DEFAULT_LOCALE.toLowerCase()}${
          DYNAMIC_ROUTE_URLS[DEFAULT_LOCALE]
        }/${parameterValue}`;
        expect(source).to.match(linkMarkupRegExp);
        const linkInputMarkup = source.match(linkMarkupRegExp).groups['link'];
        expect(linkInputMarkup).to.match(linkHrefRegExp);
        const linkHref = linkInputMarkup.match(linkHrefRegExp).groups['href'];
        expect(linkHref).to.equal(dynamicRouteUrl);
      });
    });

    // Localized <Link> (client-side)
    it(`has the correct localized link (client-side) markup for '${localeName}'`, () => {
      cy.visit({
        url: dynamicRouteIndexUrl,
        headers: {
          'Accept-Language': locale,
          Cookie: 'L=',
        },
      });

      cy.get(`#parameter-input`)
        .should('have.attr', 'value')
        .then((value) => {
          cy.get(`#link-with-parameter`)
            .should('have.attr', 'href')
            .then((href) => {
              expect(href).to.equal(`${dynamicRouteIndexUrl}/${value}`);
              expect(href).to.equal(dynamicRouteUrl); // Test with the SSR value to make sure it matches.
            });
        });
    });

    // Localized <Link> click() (client-side)
    it(`has the correct URL when clicking (client-side) on a <Link> component for '${localeName}'`, () => {
      cy.get(`#link-with-parameter`)
        .click({ timeout: 10000 })
        .then(() => {
          cy.url().should('eq', `${Cypress.config().baseUrl}${dynamicRouteUrl}`);
        });
    });

    // `useLocalizedUrl` (client-side)
    it(`has the correct URL when using (client-side) the 'useLocalizedUrl' hook for '${localeName}'`, () => {
      cy.get(`#go-back a`).click();
      cy.get(`#parameter-input`).should('have.attr', 'value');
      cy.get(`#route-push-button`)
        .click()
        .then(() => {
          cy.url().should('eq', `${Cypress.config().baseUrl}${dynamicRouteUrl}`);
        });
    });

    // Localized Canonical <Head> link (SSR)
    it(`has the correct 'canonical' <Head> link (SSR) markup for '${localeName}'`, () => {
      cy.request({
        method: 'GET',
        url: dynamicRouteUrl,
        headers: {
          'Accept-Language': locale,
          Cookie: 'L=',
        },
      }).then(({ body }: Cypress.Response<string>) => {
        source = body; // Save it for the next test to avoid multiple calls.
        const canonicalLinkMarkup = `<link rel="canonical" href="${ORIGIN}${canonicalDynamicRouteUrl}"/>`;
        expect(source).to.contain(canonicalLinkMarkup);
      });
    });

    // Localized Alternate <Head> link (SSR)
    it(`has the correct 'alternate' <Head> links (SSR) markup for '${localeName}'`, () => {
      LOCALES.forEach((locale) => {
        const alternateLinkHref = `/${locale.toLowerCase()}${
          DYNAMIC_ROUTE_URLS[locale]
        }/${parameterValue}`;
        const alternateLinkMarkup = `<link rel="alternate" href="${ORIGIN}${alternateLinkHref}" hrefLang="${locale}"/>`;
        expect(source).to.contain(alternateLinkMarkup);
      });
    });

    // Localized Canonical <Head> link (client-side)
    it(`has the correct 'canonical' <Head> link (client-side) markup for '${localeName}'`, () => {
      cy.visit({
        url: dynamicRouteUrl,
        headers: {
          'Accept-Language': locale,
          Cookie: 'L=',
        },
      });

      cy.get(`head link[rel=canonical]`)
        .should('have.attr', 'href')
        .then((href) => {
          expect(href).eq(`${ORIGIN}${canonicalDynamicRouteUrl}`);
        });
    });

    // Localized Alternate <Head> link (client-side)
    it(`has the correct 'alternate' <Head> links (client-side) markup for '${localeName}'`, () => {
      LOCALES.forEach((locale) => {
        cy.get(`head link[rel=alternate][hreflang=${locale}]`)
          .should('have.attr', 'href')
          .then((href) => {
            expect(href).eq(
              `${ORIGIN}/${locale.toLowerCase()}${DYNAMIC_ROUTE_URLS[locale]}/${parameterValue}`
            );
          });
      });
    });

    let otherLocale; // Set the "other locale" to be used by following tests.

    // Language picker (client-side)
    it(`has the correct language picker links (client-side) markup for '${localeName}'`, () => {
      const otherLocales = LOCALES.filter((otherLocale) => otherLocale != locale);
      otherLocale = otherLocales[0];
      otherLocales.forEach((otherLocale) => {
        cy.get(`#language-picker a[lang=${otherLocale}]`)
          .should('have.attr', 'href')
          .then((href) => {
            expect(href).eq(
              `/${otherLocale.toLowerCase()}${DYNAMIC_ROUTE_URLS[otherLocale]}/${parameterValue}`
            );
          });
      });
    });

    // Link after picking another language (client-side)
    it(`has the correct '<Link>' value when picking another language (client-side) for '${localeName}'`, () => {
      cy.get(`#language-picker`).trigger('mouseover');
      cy.get(`#language-picker a[lang=${otherLocale}]`).should('be.visible');
      cy.get(`#language-picker a[lang=${otherLocale}]`).click();
      cy.get(`#language-picker`).trigger('mouseout');
      cy.get(`#go-back a`)
        .should('have.attr', 'href')
        .should('eq', `/${otherLocale.toLowerCase()}${DYNAMIC_ROUTE_URLS[otherLocale]}`);
    });
  });
});
