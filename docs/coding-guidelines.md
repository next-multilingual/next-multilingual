# Coding Guidelines

Here are some of the guidelines `next-multilingual` tries to follow to keep our code consistent.

## Code 👨‍💻

- Use the [definitions](./definitions.md) to name entities
- Try to avoid acronyms (understanding quickly what a variable represents drastically increase code readability)
- Keep variable names within a reasonable length - variable names that are too long impacts readability negatively
- Typescript! Yes, Typescript can be more verbose but it helps to speed up development with better integration with IDEs, in terms of autocompletion and error detection.
- Use TSDoc! Not a lot of code out there uses TSDoc, but the integration with IDEs can also speed up development. If you know what is expected for a given a argument or what is returned from a function, you don't need to go read the code.

## IDE 𝌡

Your IDE is your most important tool. To ensure consistency when multiple developers are working on this project, we recommend using [Visual Studio Code](https://code.visualstudio.com/).

The following extensions are recommended:

- [Code Spell Checker](https://github.com/streetsidesoftware/vscode-spell-checker) - This will allow to avoid typos in variable names, comments and any file being worked on,
- [Commit Message Editor](https://github.com/bendera/vscode-commit-message-editor) - This can help follow the [conventional commits specification](https://www.conventionalcommits.org/) for those who are not familiar with it as it offers an editor. This allows to generate changelogs automatically and should be followed by everyone.
- [ESLint](https://github.com/Microsoft/vscode-eslint) - Enforces project-level coding standards.
- [Prettier](https://github.com/prettier/prettier-vscode) - Enforces project-level formatting standards.

You can also use the following settings for a better experience:

1. Open this project using Visual Studio
2. Open the command palette (Windows: `Ctrl+Shift+P` | Mac: `Cmd+Shift+P`)
3. Type: `> Open Workspace Settings (JSON)`
4. Select the option in the dropdown (this will open your workspace-specific IDE configuration)

```json
{
  "eslint.workingDirectories": [".", "example"],
  "editor.formatOnPaste": true,
  "editor.formatOnSave": true,
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptReact"],
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "javascript.updateImportsOnFileMove.enabled": "always"
}
```

### Automatic configurations

- All configuration related to the editor (end of line, encoding, indent style, indent size...) should be handled by [`.editorconfig`](../.editorconfig)
- Everything related to code formatting should be handled by Prettier ([`../.prettierrc.yaml`](../.prettierrc.yaml))
- The rest (code quality) should be handled by ESLint ([`../.eslintrc.yaml](../.eslintrc.yaml))

We decided to not try to normalize end of line sequences in local environments as it would require complex and fragile configurations. Instead we let the [.gitattributes](../.gitattributes) configuration enforce the normalization when code is pushed to Git.

## Git ⎇

- Use imperative commit messages (e.g., "update documentation")
- Commit messages should start with a lowercase letter and end with a letter (no need to try to make sentence and end with a ".")
- Use [conventional commits](https://www.conventionalcommits.org/) to generate release notes automatically. Plugins like [Commit Message Editor](https://github.com/bendera/vscode-commit-message-editor) for Visual Studio Code can help follow the syntax.
- Avoid big commits - when changing multiple files, try to stage related changes together with a representative commit message to avoid having commit messages that are unrelated to changes in certain files.

## Linting 💄

Linting is already fully configured. Because this is a monorepo, and `next-multilingual` uses different linting rules than the `example` directory make sure to configure your IDE accordingly.

In the configuration sample we provided in the IDE section, this line will make both set of rules work together:

```json
"eslint.workingDirectories": [".", "example"]
```
