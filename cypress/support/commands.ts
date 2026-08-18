/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('[data-testid="login-email"]').type(email)
    cy.get('[data-testid="login-password"]').type(password)
    cy.get('[data-testid="login-submit"]').click()
    cy.url().should('include', '/dashboard')
  }, {
    cacheAcrossSpecs: true
  })
})

Cypress.Commands.add('loginAsAdmin', () => {
  const adminEmail = Cypress.env('adminEmail') || 'admin@example.com'
  const adminPassword = Cypress.env('adminPassword') || 'admin123'
  cy.login(adminEmail, adminPassword)
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>
      loginAsAdmin(): Chainable<void>
    }
  }
}

export {}
