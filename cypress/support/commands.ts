/// <reference types="cypress" />

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    dataCy(value: string): Chainable<JQuery<HTMLElement>>
  }
}

Cypress.Commands.add('dataCy', (value) => {
  return cy.get(`[data-cy=${value}]`)
})
