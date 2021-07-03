# Coding style

`next-multilingual` uses `eslint` to cover a lot of the coding style but some rules cannot be enforced with a linter. Here are some of the guidelines we follow to keep our code consistent.

## Code

- Use the [definitions](./definitions.md) to name entities
- Try to avoid acronyms (understanding quickly what a variable represents drastically increase code readability)
- Keep variable names within a reasonable length - variable names that are too long impacts readability negatively
- Typescript! Yes, Typescript can be more verbose but it helps to speed up development with better integration with IDEs, in terms of autocompletion and error detection.
- Use Jsdoc! Not a lot of code out there uses Jsdoc, but the integration with IDEs can also speed up development speed. If you know what is expected for a given a argument or what is returned from a function, you don't need to go read the code!

## Git

- Use imperative commit messages (e.g. "update documentation")
- Commit messages should start with a lowercase letter and end with a letter (no need to try to make sentence and end with a ".")
- Avoid big commits - when changing multiple files, try to stage related changes together with a representative commit message to avoid having commit messages that are unrelated to changes in certain files.