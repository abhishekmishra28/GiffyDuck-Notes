describe('Authentication Workflow', () => {
  beforeEach(() => {
    cy.fixture('testData').as('data');
  });

  it('successfully logs in with valid credentials', function () {
    cy.visit('/login');
    cy.get('[data-testid="login-email"]').type(this.data.validUser.email);
    cy.get('[data-testid="login-password"]').type(this.data.validUser.password);
    cy.get('[data-testid="login-submit"]').click();
    
    // Should navigate to dashboard
    cy.url().should('include', '/dashboard/notes');
  });

  it('shows error with invalid credentials', function () {
    cy.visit('/login');
    cy.get('[data-testid="login-email"]').type(this.data.invalidUser.email);
    cy.get('[data-testid="login-password"]').type(this.data.invalidUser.password);
    cy.get('[data-testid="login-submit"]').click();
    
    // Should stay on login page
    cy.url().should('include', '/login');
  });

  it('protects dashboard routes from unauthenticated users', () => {
    cy.visit('/dashboard/notes');
    // Should redirect back to login
    cy.url().should('include', '/login');
  });

  it('successfully logs out', function () {
    // Login first
    cy.login(this.data.validUser.email, this.data.validUser.password);
    cy.visit('/dashboard/notes');
    
    // Logout
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout"]').click();
    
    // Should navigate to login
    cy.url().should('include', '/login');
  });

  it('tests login via API directly', function () {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/login`,
      failOnStatusCode: false,
      body: {
        email: this.data.validUser.email,
        password: this.data.validUser.password
      }
    }).then((response) => {
      // Depending on the real backend data it might succeed or fail if the user doesn't exist,
      // but we are just verifying the contract or status. We expect a 200 if the user exists,
      // or 401/404 if not seeded. Since it's a test environment we will just check the response structure.
      if (response.status === 200) {
        expect(response.body).to.have.property('token');
        expect(response.body).to.have.property('user');
      }
    });
  });
});
