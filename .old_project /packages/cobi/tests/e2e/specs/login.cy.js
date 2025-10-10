// https://docs.cypress.io/api/introduction/api.html

describe("My First Test", () => {
  it("Visits the app root url", () => {
    cy.visit("/");
    cy.get('[placeholder=Email]').type('patrick.stanton@cyoda.com');
    cy.get('[placeholder=Password]').type('l3tm31n!');
    cy.contains('Login').click();
    cy.url().should('include', '/data-mapper')
  });
});
