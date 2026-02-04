// Custom Cypress commands for Ecommerce testing

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login user via API
       * @param email - User email
       * @param password - User password
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Register user via API
       * @param userData - User registration data
       */
      register(userData: any): Chainable<void>;

      /**
       * Create product via API
       * @param productData - Product data
       * @param token - Authentication token
       */
      createProduct(productData: any, token: string): Chainable<void>;

      /**
       * Clear test database
       */
      clearDb(): Chainable<void>;
    }
  }
}

export {};
