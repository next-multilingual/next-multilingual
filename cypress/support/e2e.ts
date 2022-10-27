import './commands'

import failOnConsoleError, { Config } from 'cypress-fail-on-console-error'

const config: Config = {
  consoleMessages: [
    /** These are the warning messages from the "failing" JSX injection tests. */
    'unable to format message with key missingClose',
    'unable to format message with key missingOpen',
    'unable to format message with key invalidXml',
    'unable to format message with key duplicateTags',
    'unable to format message with key badMessageValue',
    'unable to format message with key badJsxElement',
  ],
  consoleTypes: ['error', 'warn'],
  debug: false,
}

failOnConsoleError(config)
