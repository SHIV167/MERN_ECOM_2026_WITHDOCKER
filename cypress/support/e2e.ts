// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// This is a custom command to login via API
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: Cypress.env('apiUrl') + '/api/auth/login',
    body: {
      email,
      password
    }
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

// Custom command to register a user
Cypress.Commands.add('register', (userData: any) => {
  cy.request({
    method: 'POST',
    url: Cypress.env('apiUrl') + '/api/auth/register',
    body: userData
  });
});

// Custom command to create a product
Cypress.Commands.add('createProduct', (productData: any, token: string) => {
  cy.request({
    method: 'POST',
    url: Cypress.env('apiUrl') + '/api/products',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: productData
  });
});

// Custom command to clear database
Cypress.Commands.add('clearDb', () => {
  cy.request({
    method: 'POST',
    url: Cypress.env('apiUrl') + '/api/test/clear-db',
    failOnStatusCode: false
  });
});

beforeEach(() => {
  // Clear localStorage before each test
  cy.clearLocalStorage();
});

// Hide fetch/XHR requests from command log for cleaner output
const app = window.top;

if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}
