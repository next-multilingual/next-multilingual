# Definitions

`next-multilingual` tries to use semantically correct definitions throughout its code and our definition document will help both making code more readable while using common terminology.

## Routing

_Inspired from the [Wikipedia](https://en.wikipedia.org/wiki/URL) definitions._

- **URL**: also called URI or web address, follows the following pattern
  `scheme:[//[userinfo@]host[:port]]path[?query][#fragment]`.
- **URL path**: the path portion of a URL (see URL pattern). In route configurations, a path can be partial and
  contain more than one segment.
- **URL path segment**: a portion of the path contained between slashes (`/`) or at the end of a path.
- **slug**: the human readable part of a URL (typically the last segment). Spaces are normally replaced by `-`.
- **Route**: an object that links a URL to its resource on the server.
- **Route configuration**: a configuration or part of a configuration that defines a route.

## Localization

- **Language**: a system of communication used by a particular community. For example, English, Spanish and French are languages.
- **Locale**: a locale is a language, adapted to a specific geographic region (in our case a Country). For example English U.S. is different than English U.K. - they are both locales part of the English language.
- **Translation**: the act of transforming one language into another while relaying the same message. Also known as "T9n" ("9" is for the number of characters between the "T" and the "n").
- **Localization**: the act of transforming one locale into another while relaying the same message. Also known as "L10n" ("10" is for the number of characters between the "L" and the "n").
- **Internationalization**: the process of developing software in a way that will preserve complex cultural conventions across different locales. If implemented correctly, adding a new languages should be quite simple and the final product should look natural to local users. An example of complex cultural convention is date formats. Good internationalization would use variables for all dates and let a library handle the correct display. Other example would be currency, numbers, etc. Also known as "I18n" ("18" is for the number of characters between the "L" and the "n").
- **Globalization**: the process behind expanding existing products to different markets. Translation can be expensive and having a good strategy before making such investment will ensure that its benefits outweigh its costs. 
- **TMS**: Translation management system. The platform used by linguists to perform translation.
- **LSP**: Language service provider. A business that provides translation services for other businesses.
- **TM**: Translation memory. This is the where the TMS stores previously translated string to reduce the cost of future translation requests.

## Localizable content

- **Message**: inspired from Unicode's MessageFormat, a message is a string of text that needs to be translated but that can also include other special syntax to identify variable or other linguistic rules such as plurals. Typically a library that displays messages will also be able to understand the special syntax and perform related operations such as inserting a variable's value.
- **Localizable asset**: any asset that needs to be localized. Typically refers to a file that contains many messages, but could also refer to a single message.