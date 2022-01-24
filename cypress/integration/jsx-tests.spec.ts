import { KeyValueObject } from '../../src/messages/properties';
import { LOCALE_NAMES, LOCALES } from '../constants';

export const JSX_TESTS_URLS = {
  'en-US': '/jsx-tests',
  'fr-CA': '/tests-de-jsx',
};

export const CONTACT_US_URLS = {
  'en-US': '/contact-us',
  'fr-CA': '/nous-joindre',
};

describe('The JSX test page', () => {
  LOCALES.forEach((locale) => {
    const jsxTestsUrl = `/${locale.toLowerCase()}${JSX_TESTS_URLS[locale]}`;

    let source;
    let messages: KeyValueObject;

    // Base test: one JSX element
    it(`will display the correct SSR markup when formatting a message with a single JSX element for '${LOCALE_NAMES[locale]}'`, () => {
      const propertiesFilepath = `example/pages/jsx-tests/index.${locale}.properties`;

      cy.task('getMessages', propertiesFilepath).then((keyValueObject) => {
        messages = keyValueObject as KeyValueObject;
      });

      cy.request({
        method: 'GET',
        url: jsxTestsUrl,
        headers: {
          'Accept-Language': locale,
          Cookie: 'L=',
        },
      }).then((response) => {
        source = response.body;
        const baseTest1Markup = messages.baseTest1
          .replace('<link>', `<a href="/${locale.toLowerCase()}${CONTACT_US_URLS[locale]}">`)
          .replace('</link>', '</a>')
          .replace(/'/g, '&#x27;');
        // Expected example: <div id="baseTest1">This is a <a href="/en-us/contact-us">simple link</a>.</div>
        expect(source).to.contain(`<div id="baseTest1">${baseTest1Markup}</div`);
      });
    });

    // Base test: two child elements inside another element
    it(`will display the correct SSR markup when formatting a message with two child JSX elements inside another element for '${LOCALE_NAMES[locale]}'`, () => {
      const baseTest2Markup = messages.baseTest2
        .replace('<link>', `<a href="/${locale.toLowerCase()}${CONTACT_US_URLS[locale]}">`)
        .replace('</link>', '</a>');
      // Expected example: <div id="baseTest2">This is a <a href="/en-us/contact-us">link with <strong>bold</strong> and <i>italic</i></a></div>
      expect(source).to.contain(`<div id="baseTest2">${baseTest2Markup}</div`);
    });

    // Plural + JSX test: count == 0
    it(`will display the correct SSR markup when using JSX elements inside a plural statement where the count is 0 for '${LOCALE_NAMES[locale]}'`, () => {
      const plural0Markup = messages.plural.match(/=0 {(?<message>.*?)}/m).groups['message'];
      // Expected example: <div id="plural0">No <strong>candy</strong> left.</div>
      expect(source).to.contain(`<div id="plural0">${plural0Markup}</div`);
    });

    // Plural + JSX test: count == 1
    it(`will display the correct SSR markup when using JSX elements inside a plural statement where the count is 1 for '${LOCALE_NAMES[locale]}'`, () => {
      const plural1Markup = messages.plural
        .match(/one {(?<message>.*?)}/m)
        .groups['message'].replace('#', '1');
      // Expected example: <div id="plural1">Got 1 <i>candy</i> left.</div>
      expect(source).to.contain(`<div id="plural1">${plural1Markup}</div`);
    });

    // Plural + JSX test: count == 2
    it(`will display the correct SSR markup when using JSX elements inside a plural statement where the count is 2 for '${LOCALE_NAMES[locale]}'`, () => {
      const plural2Markup = messages.plural
        .match(/other {(?<message>.*?)}/m)
        .groups['message'].replace('#', '2');
      // Expected example: <div id="plural2">Got <u>2</u> candies left.</div>
      expect(source).to.contain(`<div id="plural2">${plural2Markup}</div`);
    });

    // Escape test: `formatJsx` using '<', '>', '{', '}' and quotes
    it(`will display the correct SSR markup when using JSX elements and escaping characters for '${LOCALE_NAMES[locale]}'`, () => {
      const escapeTestMarkup = messages.escapeTest
        .replace(/'/g, '&#x27;')
        .replace(/&#x3c;/gi, '&lt;')
        .replace(/&#x3e;/gi, '&gt;')
        .replace(/&#x7b;/gi, '{')
        .replace(/&#x7d;/gi, '}');
      // Expected example: <div id="escapeTest">This message <strong>should</strong> render with 3 quotes &#x27;&#x27;&#x27;, &lt; &lt; &gt; &gt; greater and lower than characters as well was, { { } } curly brackets.</div>
      expect(source).to.contain(`<div id="escapeTest">${escapeTestMarkup}</div>`);
    });

    // Test that JSX elements can support style and events
    it(`will display the correct SSR markup when using JSX with style and events for '${LOCALE_NAMES[locale]}'`, () => {
      const elementSource = source.match(/<div id="styleAndEvents">(?<message>.*?)<\/div>/m).groups
        .message;
      const strongClass = elementSource.match(/strong class="(?<strongClass>.*?)"/m).groups
        .strongClass;
      const aClass = elementSource.match(/a class="(?<aClass>.*?)"/m).groups.aClass;

      const styleAndEventsMarkup = messages.styleAndEvents
        .replace('<link>', `<a href="/${locale.toLowerCase()}${CONTACT_US_URLS[locale]}">`)
        .replace('</link>', '</a>')
        .replace('<strong>', `<strong class="${strongClass}">`)
        .replace('<a href', `<a class="${aClass}" href`);
      // Expected example: <div id="styleAndEvents">This message should have <strong class="jsx-tests_strong__t_45m">style</strong> and <a class="jsx-tests_link__wsQoZ" href="/en-us/contact-us">events</a> on its JSX elements.</div>
      expect(elementSource).to.eq(styleAndEventsMarkup);
    });

    // All failing `formatJsx` calls should return empty SSR markup
    it(`will not create any SSR markup when testing bad use cases of messages with JSX elements for '${LOCALE_NAMES[locale]}'`, () => {
      expect(source).to.contain(`<div id="missingClose1"></div`);
      expect(source).to.contain(`<div id="missingClose2"></div`);
      expect(source).to.contain(`<div id="missingClose3"></div`);
      expect(source).to.contain(`<div id="missingClose4"></div`);
      expect(source).to.contain(`<div id="missingClose5"></div`);
      expect(source).to.contain(`<div id="missingClose6"></div`);
      expect(source).to.contain(`<div id="missingClose7"></div`);
      expect(source).to.contain(`<div id="missingOpen1"></div`);
      expect(source).to.contain(`<div id="missingOpen2"></div`);
      expect(source).to.contain(`<div id="missingOpen3"></div`);
      expect(source).to.contain(`<div id="missingOpen4"></div`);
      expect(source).to.contain(`<div id="missingOpen5"></div`);
      expect(source).to.contain(`<div id="missingOpen6"></div`);
      expect(source).to.contain(`<div id="missingOpen7"></div`);
      expect(source).to.contain(`<div id="invalidXml1"></div`);
      expect(source).to.contain(`<div id="invalidXml2"></div`);
      expect(source).to.contain(`<div id="duplicateTags"></div`);
      expect(source).to.contain(`<div id="badMessageValue1"></div`);
      expect(source).to.contain(`<div id="badMessageValue2"></div`);
      expect(source).to.contain(`<div id="badJsxElement1"></div`);
      expect(source).to.contain(`<div id="badJsxElement2"></div`);
    });

    // TODO add client side test:
    // - check events
    // - check for unexpected warming messages
  });
});
