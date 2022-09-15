import {
  ACTUAL_DEFAULT_LOCALE,
  ACTUAL_LOCALES,
  BASE_PATH,
  LOCALE_NAMES,
  LocalizedConstant,
  LocalizedConstantObject,
} from '../constants'
import { getMessages } from '../utils'

export const JSX_TESTS_URLS: LocalizedConstant = {
  'en-US': '/tests/jsx-injection',
  'fr-CA': '/tests/injection-de-jsx',
}

export const CONTACT_US_URLS: LocalizedConstant = {
  'en-US': '/contact-us',
  'fr-CA': '/nous-joindre',
}

/**
 * Convert HTML entities (escape codes) by their original characters.
 *
 * @param markup - The HTML markup in string format.
 *
 * @returns The equivalent markup with original characters instead of HTML entities.
 */
function convertHtmlEntities(markup: string): string {
  return markup
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s/g, ' ')
    .trim()
}

/** Get the file path for the city messages. */
const getMessagesFilePath = (locale: string): string =>
  `example/pages${JSX_TESTS_URLS[ACTUAL_DEFAULT_LOCALE]}/index.${locale}.properties`

const JSX_INJECTION_MESSAGES: LocalizedConstantObject = {}

before(() => {
  ACTUAL_LOCALES.forEach((locale) => {
    cy.readFile(getMessagesFilePath(locale)).then((content) => {
      JSX_INJECTION_MESSAGES[locale] = getMessages(content as string)
    })
  })
})

describe('The JSX test page', () => {
  ACTUAL_LOCALES.forEach((locale) => {
    const localeName = LOCALE_NAMES[locale]
    const localizedContentUsUrl = CONTACT_US_URLS[locale]
    const jsxTestsUrl = `${BASE_PATH}/${locale.toLowerCase()}${JSX_TESTS_URLS[locale]}`

    let source: string

    let baseTest1Markup: string,
      baseTest2Markup: string,
      plural0Markup: string,
      plural1Markup: string,
      plural2Markup: string,
      escapeTestMarkup: string,
      styleAndEventsMarkup: string

    // Base SSR test: one JSX element
    it(`will display the correct SSR markup when formatting a message with a single JSX element for '${localeName}'`, () => {
      cy.request(jsxTestsUrl).then((response) => {
        source = response.body as string
        baseTest1Markup = JSX_INJECTION_MESSAGES[locale].baseTest1
          .replace(
            '<link>',
            `<a href="${BASE_PATH}/${locale.toLowerCase()}${localizedContentUsUrl}">`
          )
          .replace('</link>.', `</a>.`)
          .replace(/'/g, '&#x27;')
        // Expected example: <div id="baseTest1">This is a <a href="/en-us/contact-us">simple link</a>.</div>
        expect(source).to.contain(`<div id="baseTest1">${baseTest1Markup}</div`)
      })
    })

    // Base SSR test: two child elements inside another element
    it(`will display the correct SSR markup when formatting a message with two child JSX elements inside another element for '${localeName}'`, () => {
      baseTest2Markup = JSX_INJECTION_MESSAGES[locale].baseTest2
        .replace(
          '<link>',
          `<a href="${BASE_PATH}/${locale.toLowerCase()}${localizedContentUsUrl}">`
        )
        .replace('</link>', '</a>')
        .replace('<strong>', `<strong>`)
        .replace('<i>', `<i>`)
      // Expected example: <div id="baseTest2">This is a <a href="/en-us/contact-us">link with <strong>bold</strong> and <i>italic</i></a></div>
      expect(source).to.contain(`<div id="baseTest2">${baseTest2Markup}</div`)
    })

    // Plural + JSX SSR test: count == 0
    it(`will display the correct SSR markup when using JSX elements inside a plural statement where the count is 0 for '${localeName}'`, () => {
      plural0Markup = JSX_INJECTION_MESSAGES[locale].plural
        .match(/=0 {(?<message>.*?)}/m)
        .groups['message'].replace('<strong>', `<strong>`)
      // Expected example: <div id="plural0">No <strong>candy</strong> left.</div>
      expect(source).to.contain(`<div id="plural0">${plural0Markup}</div>`)
    })

    // Plural + JSX SSR test: count == 1
    it(`will display the correct SSR markup when using JSX elements inside a plural statement where the count is 1 for '${localeName}'`, () => {
      plural1Markup = JSX_INJECTION_MESSAGES[locale].plural
        .match(/one {(?<message>.*?)}/m)
        .groups['message'].replace('#', '1')
        .replace('<i>', `<i>`)
      // Expected example: <div id="plural1">Got 1 <i>candy</i> left.</div>
      expect(source).to.contain(`<div id="plural1">${plural1Markup}</div>`)
    })

    // Plural + JSX SSR test: count == 2
    it(`will display the correct SSR markup when using JSX elements inside a plural statement where the count is 2 for '${localeName}'`, () => {
      plural2Markup = JSX_INJECTION_MESSAGES[locale].plural
        .match(/other {(?<message>.*?)}/m)
        .groups['message'].replace('#', '2')
        .replace('<u>', `<u>`)
      // Expected example: <div id="plural2">Got <u>2</u> candies left.</div>
      expect(source).to.contain(`<div id="plural2">${plural2Markup}</div`)
    })

    // Escape SSR test: `formatJsx` using '<', '>', '{', '}' and quotes
    it(`will display the correct SSR markup when using JSX elements and escaping characters for '${localeName}'`, () => {
      escapeTestMarkup = JSX_INJECTION_MESSAGES[locale].escapeTest
        .replace(/'/g, '&#x27;')
        .replace(/&#x3c;/gi, '&lt;')
        .replace(/&#x3e;/gi, '&gt;')
        .replace(/&#x7b;/gi, '{')
        .replace(/&#x7d;/gi, '}')
        .replace('<strong>', `<strong>`)

      // Expected example: <div id="escapeTest">This message <strong>should</strong> render with 3 quotes &#x27;&#x27;&#x27;, &lt; &lt; &gt; &gt; greater and lower than characters as well was, { { } } curly brackets.</div>
      expect(source).to.contain(`<div id="escapeTest">${escapeTestMarkup}</div>`)
    })

    // SSR test that checks if JSX elements can support style and events
    it(`will display the correct SSR markup when using JSX with style and events for '${localeName}'`, () => {
      const elementSource = source.match(/<div id="styleAndEvents">(?<message>.*?)<\/div>/m).groups
        .message
      const strongClass = elementSource.match(/strong class="(?<strongClass>.*?)"/m).groups
        .strongClass
      const aClass = elementSource.match(/a class="(?<aClass>.*?)"/m).groups.aClass

      styleAndEventsMarkup = JSX_INJECTION_MESSAGES[locale].styleAndEvents
        .replace(
          '<link>',
          `<a href="${BASE_PATH}/${locale.toLowerCase()}${localizedContentUsUrl}">`
        )
        .replace('</link>', '</a>')
        .replace('<strong>', `<strong class="${strongClass}">`)
        .replace('<a href', `<a class="${aClass}" href`)
      // Expected example: <div id="styleAndEvents">This message should have <strong class="jsx-tests_strong__t_45m">style</strong> and <a class="jsx-tests_link__wsQoZ" href="/en-us/contact-us">events</a> on its JSX elements.</div>
      expect(elementSource).to.eq(styleAndEventsMarkup)
    })

    // All failing `formatJsx` calls should return empty SSR markup
    it(`will not create any SSR markup when testing bad use cases of messages with JSX elements for '${localeName}'`, () => {
      expect(source).to.contain(`<div id="missingClose1"></div>`)
      expect(source).to.contain(`<div id="missingClose2"></div>`)
      expect(source).to.contain(`<div id="missingClose3"></div>`)
      expect(source).to.contain(`<div id="missingClose4"></div>`)
      expect(source).to.contain(`<div id="missingClose5"></div>`)
      expect(source).to.contain(`<div id="missingClose6"></div>`)
      expect(source).to.contain(`<div id="missingClose7"></div>`)
      expect(source).to.contain(`<div id="missingOpen1"></div>`)
      expect(source).to.contain(`<div id="missingOpen2"></div>`)
      expect(source).to.contain(`<div id="missingOpen3"></div>`)
      expect(source).to.contain(`<div id="missingOpen4"></div>`)
      expect(source).to.contain(`<div id="missingOpen5"></div>`)
      expect(source).to.contain(`<div id="missingOpen6"></div>`)
      expect(source).to.contain(`<div id="missingOpen7"></div>`)
      expect(source).to.contain(`<div id="invalidXml1"></div>`)
      expect(source).to.contain(`<div id="invalidXml2"></div>`)
      expect(source).to.contain(`<div id="duplicateTags"></div>`)
      expect(source).to.contain(`<div id="badMessageValue1"></div>`)
      expect(source).to.contain(`<div id="badMessageValue2"></div>`)
      expect(source).to.contain(`<div id="badJsxElement1"></div>`)
      expect(source).to.contain(`<div id="badJsxElement2"></div>`)
    })

    // Base client side test: one JSX element
    it(`will display the correct client side markup when formatting a message with a single JSX element for '${localeName}'`, () => {
      cy.visit({
        url: jsxTestsUrl,
        headers: {
          'Accept-Language': locale,
          Cookie: 'L=',
        },
      })
      cy.get('#baseTest1')
        .invoke('html')
        .then((markup) => {
          expect(convertHtmlEntities(markup)).to.eq(convertHtmlEntities(baseTest1Markup))
        })
    })

    // Base client side test: two child elements inside another element
    it(`will display the correct client side markup when formatting a message with two child JSX elements inside another element for '${localeName}'`, () => {
      cy.get('#baseTest2')
        .invoke('html')
        .then((markup) => {
          expect(convertHtmlEntities(markup)).to.eq(convertHtmlEntities(baseTest2Markup))
        })
    })

    // Plural + JSX client side test: count == 0
    it(`will display the correct client side markup when using JSX elements inside a plural statement where the count is 0 for '${localeName}'`, () => {
      cy.get('#plural0')
        .invoke('html')
        .then((markup) => {
          expect(convertHtmlEntities(markup)).to.eq(convertHtmlEntities(plural0Markup))
        })
    })

    // Plural + JSX client side test: count == 1
    it(`will display the correct client side markup when using JSX elements inside a plural statement where the count is 1 for '${localeName}'`, () => {
      cy.get('#plural1')
        .invoke('html')
        .then((markup) => {
          expect(convertHtmlEntities(markup)).to.eq(convertHtmlEntities(plural1Markup))
        })
    })

    // Plural + JSX client side test: count == 2
    it(`will display the correct client side markup when using JSX elements inside a plural statement where the count is 2 for '${localeName}'`, () => {
      cy.get('#plural2')
        .invoke('html')
        .then((markup) => {
          expect(convertHtmlEntities(markup)).to.eq(convertHtmlEntities(plural2Markup))
        })
    })

    // Escape client side test: `formatJsx` using '<', '>', '{', '}' and quotes
    it(`will display the correct client side markup when using JSX elements and escaping characters for '${localeName}'`, () => {
      cy.get('#escapeTest')
        .invoke('html')
        .then((markup) => {
          expect(convertHtmlEntities(markup)).to.eq(convertHtmlEntities(escapeTestMarkup))
        })
    })

    // Client side test that checks if JSX elements can support style and events
    it(`will display the correct client side markup when using JSX with style and events for '${localeName}'`, () => {
      cy.get('#styleAndEvents')
        .invoke('html')
        .then((markup) => {
          expect(convertHtmlEntities(markup)).to.eq(convertHtmlEntities(styleAndEventsMarkup))
        })
    })

    // Client side test that checks if styles (CSS) are correctly applied to JSX elements
    it(`will have the correct client side styles (CSS) when using JSX with styles for '${localeName}'`, () => {
      cy.get('#styleAndEvents strong').should('have.css', 'font-size', '20px')
      cy.get('#styleAndEvents a').should('have.css', 'color', 'rgb(255, 0, 0)')
    })

    // Client side test that checks if events are correctly applied to JSX elements
    it(`will have the correct events when using JSX with events for '${localeName}'`, () => {
      cy.get('#styleAndEvents a')
        .click()
        .click()
        .then(() => {
          cy.window().then((window) => {
            expect(window['_styleAndEventsClickCount']).to.eq(2)
          })
        })
    })

    // All failing `formatJsx` calls should return empty client side markup
    it(`will not create any client side markup when testing bad use cases of messages with JSX elements for '${localeName}'`, () => {
      const emptyElements = [
        'missingClose1',
        'missingClose2',
        'missingClose3',
        'missingClose4',
        'missingClose5',
        'missingClose6',
        'missingClose7',
        'missingOpen1',
        'missingOpen2',
        'missingOpen3',
        'missingOpen4',
        'missingOpen5',
        'missingOpen6',
        'missingOpen7',
        'invalidXml1',
        'invalidXml2',
        'duplicateTags',
        'badMessageValue1',
        'badMessageValue2',
        'badJsxElement1',
        'badJsxElement2',
      ]

      emptyElements.forEach((emptyElement) => {
        cy.get(`#${emptyElement}`)
          .invoke('html')
          .then((markup) => {
            expect(markup).to.be.empty
          })
      })
    })
  })
})
