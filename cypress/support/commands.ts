import 'cypress-wait-until'

// This command allows to log to the console when running headless.
Cypress.Commands.overwrite('log', (name, message) => cy.task('log', message))
