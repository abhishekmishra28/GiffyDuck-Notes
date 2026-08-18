describe('AI Assistant Integration', () => {
  beforeEach(() => {
    cy.fixture('testData').as('data');
    cy.get('@data').then((data: any) => {
      cy.login(data.validUser.email, data.validUser.password);
    });
  });

  it('intercepts AI suggestion and displays correctly', function () {
    cy.visit('/dashboard/notes');
    
    // Create or open a note
    cy.get('body').then($body => {
      if ($body.find('[data-testid="create-note-empty"]').length > 0) {
        cy.get('[data-testid="create-note-empty"]').click();
      } else {
        cy.get('[data-testid="create-note"]').click();
      }
    });

    cy.get('[data-testid="note-title"]').type('AI Test Note');
    cy.get('[data-testid="note-content"]').type('Help me write this better.');

    // Intercept the AI suggestion endpoint to avoid calling real Gemini API
    cy.intercept('POST', `${Cypress.env('apiUrl')}/ai/suggest`, {
      statusCode: 200,
      body: {
        suggestion: 'This is an intercepted AI suggestion to make your note better.'
      }
    }).as('aiSuggest');

    // Trigger AI suggestion (we need to make sure the AI button is visible, 
    // it might only be visible in edit mode)
    cy.get('button').contains('AI Suggest').click();

    cy.wait('@aiSuggest');

    // Verify the intercepted text was injected
    cy.get('[data-testid="note-content"]').should('have.value', 'This is an intercepted AI suggestion to make your note better.');
  });

  it('handles AI API failure gracefully', function () {
    cy.visit('/dashboard/notes');
    
    cy.get('body').then($body => {
      if ($body.find('[data-testid="create-note-empty"]').length > 0) {
        cy.get('[data-testid="create-note-empty"]').click();
      } else {
        cy.get('[data-testid="create-note"]').click();
      }
    });

    cy.get('[data-testid="note-title"]').type('AI Test Note Error');
    cy.get('[data-testid="note-content"]').type('Trigger an error.');

    // Intercept the AI suggestion endpoint with an error
    cy.intercept('POST', `${Cypress.env('apiUrl')}/ai/suggest`, {
      statusCode: 500,
      body: {
        message: 'Internal Server Error from Gemini'
      }
    }).as('aiSuggestError');

    cy.get('button').contains('AI Suggest').click();

    cy.wait('@aiSuggestError');

    // UI should not crash and should show some error toast (Sonner toast is usually visible)
    cy.get('body').should('contain', 'Internal Server Error from Gemini');
  });
});
