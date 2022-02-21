import { ACTUAL_LOCALES, LOCALE_NAMES } from '../constants';

export const ANCHOR_LINKS_TESTS_URLS = {
  'en-US': '/tests/anchor-links',
  'fr-CA': '/tests/liens-internes',
};

export const ANCHOR_LINKS_TESTS_FRAGMENTS = {
  'en-US': 'paragraph-3',
  'fr-CA': 'paragraphe-3',
};

export const LONG_PAGE_TESTS_URLS = {
  'en-US': `${ANCHOR_LINKS_TESTS_URLS['en-US']}/long-page`,
  'fr-CA': `${ANCHOR_LINKS_TESTS_URLS['fr-CA']}/page-longue`,
};

describe('An anchor link', () => {
  ACTUAL_LOCALES.forEach((locale) => {
    const anchorLinksTestsUrl = `/${locale.toLowerCase()}${ANCHOR_LINKS_TESTS_URLS[locale]}`;
    const longPageTestsUrl = `/${locale.toLowerCase()}${LONG_PAGE_TESTS_URLS[locale]}`;
    const linkWithFragment = `${longPageTestsUrl}#${ANCHOR_LINKS_TESTS_FRAGMENTS[locale]}`;

    it(`will have the correct SSR markup when using an anchor link for '${LOCALE_NAMES[locale]}'`, () => {
      cy.request({
        method: 'GET',
        url: anchorLinksTestsUrl,
        headers: {
          'Accept-Language': locale,
          Cookie: 'L=',
        },
      }).then((response) => {
        expect(response.body).to.contain(`<a href="${linkWithFragment}">`);
      });
    });

    it(`will have the correct client side href value when using an anchor link for '${LOCALE_NAMES[locale]}'`, () => {
      cy.visit({
        url: anchorLinksTestsUrl,
        headers: {
          'Accept-Language': locale,
          Cookie: 'L=',
        },
      });
      cy.get('#anchor-link-test a')
        .should('have.attr', 'href')
        .then((href) => {
          expect(href).eq(linkWithFragment);
        });
    });

    it(`will redirect to the correct page and position when clicked for '${LOCALE_NAMES[locale]}'`, () => {
      cy.get(`#anchor-link-test a`)
        .click({ timeout: 10000 })
        .then(() => {
          cy.url().should('eq', `${Cypress.config().baseUrl}${linkWithFragment}`);

          cy.window().then(($window) => {
            expect($window.scrollY).to.not.equal('0');
          });
        });
    });
  });
});
