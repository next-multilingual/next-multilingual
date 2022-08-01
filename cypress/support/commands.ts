import 'cypress-wait-until'

// This command allows to log to the console when running headless.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
Cypress.Commands.overwrite('log', (name, message) => cy.task('log', message))
