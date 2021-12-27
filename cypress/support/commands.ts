// This command allows to log to the console when running headless.
Cypress.Commands.overwrite('log', (subject, message) => cy.task('log', message));
