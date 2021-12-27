import './commands';

import failOnConsoleError, { consoleType } from 'cypress-fail-on-console-error';

const config = {
  includeConsoleTypes: [consoleType.ERROR, consoleType.WARN],
};

failOnConsoleError(config);
