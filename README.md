# next-multilingual

An opinionated end-to-end **multilingual** solution for Next.js.

## Installation

```
npm install next-multilingual
```

## Usage

What does this package include?

- A [multilingual router](/src/router/README.md) `MulRouter` that supports routing on localized URL.
- [Multilingual links](/src/link/README.md) `<MulLink>` to get URLs in the current locale.
- A [multilingual `Head` component](/src/head/README.md) `<MulHead>` that generates the correct alternative links for search engines.
- Modular localized string configuration support that works just like CSS (no more files containing shared strings).

`next-multilingual` has been tested as a whole, and individual components have not been tested separately. It is meant to be a holistic solution to meet all localization needs for Next.js.

Look in the `example` directory to see a complete implementation in action.

TODO:

- understand/document links
- understand/document head