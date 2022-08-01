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
  "files.eol": "\n",
  "eslint.workingDirectories": [".", "example"],
  "editor.formatOnPaste": true,
  "editor.formatOnSave": true,
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptReact"],
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "git.autofetch": true,
  "git.enableSmartCommit": true,
  "files.exclude": {
    "**/.git": false
  },
  "javascript.updateImportsOnFileMove.enabled": "always"
}
```

More details around some of these options will be provided in the rest of this document.

## File format 📁

For convenience, we included an [`.editorconfig`](../.editorconfig) file to help normalize settings across different IDEs.

### Newlines

> ⚠️ In [Visual Studio Code](https://code.visualstudio.com/), if you select the wrong end of line sequence (option in your bar at the bottom), it will override our ESLint/Prettier configuration and show linting errors in your files.

To avoid this, make sure that you use `LF` as your end of line sequence (this is the best option, supported by all operating system, as explained [here](https://prettier.io/docs/en/options.html#end-of-line)).

Additionally you have 2 configurations that can help avoid this wrong end of line sequences:

- Add this configuration in Visual Studio Code `settings.json`: `"files.eol": "\n"`
- Configure Git to only use `LF` by running this command: `git config --global core.autocrlf true`

### Encoding

UTF-8 (without BOM) should be used for all files. Some IDE like IntelliJ are known to have issues with `.properties` file and escape unicode characters. Make sure to use the correct IDE settings to avoid encoding issues.

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
