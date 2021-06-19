# next-multilingual

An opinionated end-to-end **multilingual** solution for Next.js.

## Installation

```
npm install next-multilingual
```

## Usage

What does this package include?

- A [multilingual router](/src/router/README.md) `MulRouter` that supports localized URL routing.
- [Multilingual links](/src/link/README.md) `<MulLink>`, an extension of Next.js' `<Link>` for localized URLs.
- A [multilingual `Head` component](/src/head/README.md) `<MulHead>` to generate alternative links (for SEO) in the HTML `<head>`.
- Modular localized string configuration support that works just like CSS (no more files containing shared strings).

`next-multilingual` has been tested as a whole, and individual components have not been tested separately. It is meant to be a holistic solution to meet all localization needs for Next.js.

Look in the `example` directory to see a complete implementation in action.

## Why `next-multilingual`?

Why did we put so much efforts with these details? Because our hypothesis is that it can have a major impact on:

- SEO;
- boosting customer trust with more locally relevant content;
- making string management easier and more modular.

More details an be found on the implementation and design decision in the readme files of each API. 

TODO:

- --> title suffix instead?? fix Router (Rewrite) /en-us/homepage -> /en-us (or remove - it might not be used?)
- link titles? (not supported by Next.js?)
- fix example `npm run build`
- understand/document head
- add strings key prefix support
