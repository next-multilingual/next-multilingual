describe('Home Page', () => {
  it('should display home page', () => {
    cy.visit('/')
    cy.get('h1').contains('Welcome')
    cy.get('html').should('have.attr', 'lang', 'en-US')
  })
})
