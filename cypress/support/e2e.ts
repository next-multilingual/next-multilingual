import './commands'

import failOnConsoleError, { consoleType } from 'cypress-fail-on-console-error'
import { Config } from 'cypress-fail-on-console-error/dist/types/Config'

const config: Config = {
  excludeMessages: [
    /** These are the warning messages from the "failing" JSX injection tests. */
    'unable to format message with key missingClose',
    'unable to format message with key missingOpen',
    'unable to format message with key invalidXml',
    'unable to format message with key duplicateTags',
    'unable to format message with key badMessageValue',
    'unable to format message with key badJsxElement',
  ],
  includeConsoleTypes: [consoleType.ERROR, consoleType.WARN],
}

failOnConsoleError(config)
