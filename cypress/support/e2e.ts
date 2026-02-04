// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  if (err.message.includes('Script error')) {
    return false
  }
  return true
})

// This is a custom command to login via API
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: Cypress.env('apiUrl') + '/auth/login',
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
    url: Cypress.env('apiUrl') + '/auth/register',
    body: userData
  });
});

// Custom command to create a product
Cypress.Commands.add('createProduct', (productData: any, token: string) => {
  cy.request({
    method: 'POST',
    url: Cypress.env('apiUrl') + '/products',
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
    url: Cypress.env('apiUrl') + '/test/clear-db',
    failOnStatusCode: false
  });
});

// Custom command to seed database
Cypress.Commands.add('seedDb', () => {
  cy.request({
    method: 'POST',
    url: Cypress.env('apiUrl') + '/test/seed-db',
    failOnStatusCode: false
  });
});

// Custom command for UI login
Cypress.Commands.add('uiLogin', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('[data-cy=email]').type(email)
  cy.get('[data-cy=password]').type(password)
  cy.get('[data-cy=login-button]').click()
  cy.url().should('not.include', '/login')
})

// Custom command for UI registration
Cypress.Commands.add('uiRegister', (userData: any) => {
  cy.visit('/register')
  cy.get('[data-cy=name]').type(userData.name)
  cy.get('[data-cy=email]').type(userData.email)
  cy.get('[data-cy=password]').type(userData.password)
  cy.get('[data-cy=confirm-password]').type(userData.confirmPassword)
  cy.get('[data-cy=register-button]').click()
  cy.url().should('not.include', '/register')
})

// Custom command to add product to cart
Cypress.Commands.add('addToCart', (productId: string) => {
  cy.get(`[data-cy=product-${productId}]`).within(() => {
    cy.get('[data-cy=add-to-cart]').click()
  })
  cy.get('[data-cy=cart-count]').should('contain', '1')
})

// Custom command to search products
Cypress.Commands.add('searchProducts', (searchTerm: string) => {
  cy.get('[data-cy=search-input]').type(searchTerm)
  cy.get('[data-cy=search-button]').click()
  cy.url().should('include', `search=${searchTerm}`)
})

// Custom command to filter by category
Cypress.Commands.add('filterByCategory', (category: string) => {
  cy.get('[data-cy=category-filter]').select(category)
  cy.get('[data-cy=apply-filter]').click()
})

// Custom command for checkout process
Cypress.Commands.add('checkout', (shippingData: any) => {
  cy.get('[data-cy=cart-button]').click()
  cy.get('[data-cy=checkout-button]').click()
  
  // Fill shipping information
  cy.get('[data-cy=shipping-name]').type(shippingData.name)
  cy.get('[data-cy=shipping-address]').type(shippingData.address)
  cy.get('[data-cy=shipping-city]').type(shippingData.city)
  cy.get('[data-cy=shipping-zip]').type(shippingData.zip)
  
  // Select payment method
  cy.get('[data-cy=payment-method]').select(shippingData.paymentMethod)
  
  // Place order
  cy.get('[data-cy=place-order-button]').click()
})

// Custom command to measure page load time
Cypress.Commands.add('measurePageLoad', (pageName: string) => {
  cy.window().then((win) => {
    const navigationEntries = win.performance.getEntriesByType('navigation')
    const loadTime = navigationEntries[0].loadEventEnd - navigationEntries[0].loadEventStart
    cy.log(`${pageName} page load time: ${loadTime}ms`)
    cy.wrap(loadTime).should('be.lessThan', 3000) // Page should load in less than 3 seconds
  })
})

// Custom command to check accessibility
Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe()
  cy.checkA11y()
})

// Custom command to validate API responses
Cypress.Commands.add('validateApiResponse', (endpoint: string, expectedStatus: number) => {
  cy.request(endpoint).then((response) => {
    expect(response.status).to.eq(expectedStatus)
    expect(response.headers).to.have.property('content-type')
  })
})

// Custom command to test mobile view
Cypress.Commands.add('testMobileView', () => {
  cy.viewport(375, 667) // iPhone 6/7/8 dimensions
  cy.get('[data-cy=mobile-menu]').should('be.visible')
})

// Custom command to test tablet view
Cypress.Commands.add('testTabletView', () => {
  cy.viewport(768, 1024) // iPad dimensions
  cy.get('[data-cy=sidebar]').should('be.visible')
})

// Custom command to test desktop view
Cypress.Commands.add('testDesktopView', () => {
  cy.viewport(1280, 720) // Standard desktop
  cy.get('[data-cy=main-navigation]').should('be.visible')
})

// Custom command to test form validation
Cypress.Commands.add('testFormValidation', (formSelector: string, validationRules: any) => {
  cy.get(formSelector).within(() => {
    Object.keys(validationRules).forEach((field) => {
      const rules = validationRules[field]
      cy.get(`[data-cy=${field}]`).clear()
      
      if (rules.required) {
        cy.get(`[data-cy=${field}]`).blur()
        cy.get(`[data-cy=${field}-error]`).should('be.visible')
      }
      
      if (rules.minLength) {
        cy.get(`[data-cy=${field}]`).type('a'.repeat(rules.minLength - 1))
        cy.get(`[data-cy=${field}]`).blur()
        cy.get(`[data-cy=${field}-error]`).should('contain', 'at least')
      }
      
      if (rules.email) {
        cy.get(`[data-cy=${field}]`).type('invalid-email')
        cy.get(`[data-cy=${field}]`).blur()
        cy.get(`[data-cy=${field}-error]`).should('contain', 'valid email')
      }
    })
  })
})

// Custom command to test dark mode
Cypress.Commands.add('testDarkMode', () => {
  cy.get('[data-cy=theme-toggle]').click()
  cy.get('body').should('have.class', 'dark')
  cy.get('[data-cy=theme-toggle]').click()
  cy.get('body').should('not.have.class', 'dark')
})

// Custom command to intercept API calls
Cypress.Commands.add('interceptApiCalls', () => {
  cy.intercept('GET', `${Cypress.env('apiUrl')}/products*`).as('getProducts')
  cy.intercept('POST', `${Cypress.env('apiUrl')}/auth/login`).as('login')
  cy.intercept('POST', `${Cypress.env('apiUrl')}/auth/register`).as('register')
  cy.intercept('POST', `${Cypress.env('apiUrl')}/cart/add`).as('addToCart')
  cy.intercept('POST', `${Cypress.env('apiUrl')}/orders`).as('createOrder')
})

beforeEach(() => {
  // Clear localStorage before each test
  cy.clearLocalStorage();
  
  // Clear and seed database for clean test state
  cy.clearDb();
  cy.seedDb();
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
