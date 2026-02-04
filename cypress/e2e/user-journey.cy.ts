describe('Ecommerce User Journey', () => {
  beforeEach(() => {
    // Clear database and visit homepage
    cy.clearDb();
    cy.visit('/');
  });

  describe('User Registration and Login', () => {
    it('should allow user to register and login', () => {
      const userData = {
        email: 'testuser@example.com',
        password: 'password123',
        name: 'Test User'
      };

      // Visit register page
      cy.visit('/register');

      // Fill registration form
      cy.get('[data-cy=name-input]').type(userData.name);
      cy.get('[data-cy=email-input]').type(userData.email);
      cy.get('[data-cy=password-input]').type(userData.password);
      cy.get('[data-cy=confirm-password-input]').type(userData.password);

      // Submit registration
      cy.get('[data-cy=register-button]').click();

      // Should redirect to login or dashboard
      cy.url().should('not.include', '/register');

      // Now login
      cy.visit('/login');
      
      cy.get('[data-cy=email-input]').type(userData.email);
      cy.get('[data-cy=password-input]').type(userData.password);
      cy.get('[data-cy=login-button]').click();

      // Should be logged in
      cy.url().should('not.include', '/login');
      cy.get('[data-cy=user-menu]').should('be.visible');
      cy.get('[data-cy=user-name]').should('contain', userData.name);
    });

    it('should show error for invalid login', () => {
      cy.visit('/login');
      
      cy.get('[data-cy=email-input]').type('invalid@example.com');
      cy.get('[data-cy=password-input]').type('wrongpassword');
      cy.get('[data-cy=login-button]').click();

      cy.get('[data-cy=error-message]').should('be.visible');
      cy.url().should('include', '/login');
    });
  });

  describe('Product Browsing', () => {
    beforeEach(() => {
      // Login as test user
      cy.login('testuser@example.com', 'password123');
    });

    it('should display products on homepage', () => {
      cy.visit('/');
      
      // Check if products are displayed
      cy.get('[data-cy=product-card]').should('have.length.greaterThan', 0);
      cy.get('[data-cy=product-name]').first().should('be.visible');
      cy.get('[data-cy=product-price]').first().should('be.visible');
    });

    it('should filter products by category', () => {
      cy.visit('/');
      
      // Click on category filter
      cy.get('[data-cy=category-filter]').first().click();
      
      // Check if products are filtered
      cy.get('[data-cy=product-card]').should('have.length.greaterThan', 0);
    });

    it('should search products', () => {
      cy.visit('/');
      
      // Use search functionality
      cy.get('[data-cy=search-input]').type('laptop');
      cy.get('[data-cy=search-button]').click();
      
      // Check search results
      cy.get('[data-cy=product-card]').should('have.length.greaterThan', 0);
    });

    it('should view product details', () => {
      cy.visit('/');
      
      // Click on first product
      cy.get('[data-cy=product-card]').first().click();
      
      // Should be on product detail page
      cy.url().should('match', /\/product\/.*/);
      cy.get('[data-cy=product-title]').should('be.visible');
      cy.get('[data-cy=product-description]').should('be.visible');
      cy.get('[data-cy=product-price]').should('be.visible');
      cy.get('[data-cy=add-to-cart-button]').should('be.visible');
    });
  });

  describe('Shopping Cart', () => {
    beforeEach(() => {
      cy.login('testuser@example.com', 'password123');
    });

    it('should add product to cart', () => {
      cy.visit('/');
      
      // Add first product to cart
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart-button]').click();
      });

      // Check cart notification
      cy.get('[data-cy=cart-notification]').should('be.visible');
      
      // Check cart count
      cy.get('[data-cy=cart-count]').should('contain', '1');
    });

    it('should view cart', () => {
      // Add product to cart first
      cy.visit('/');
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart-button]').click();
      });

      // View cart
      cy.get('[data-cy=cart-button]').click();
      cy.url().should('include', '/cart');

      // Check cart items
      cy.get('[data-cy=cart-item]').should('have.length', 1);
      cy.get('[data-cy=cart-item-name]').should('be.visible');
      cy.get('[data-cy=cart-item-price]').should('be.visible');
      cy.get('[data-cy=cart-total]').should('be.visible');
    });

    it('should remove item from cart', () => {
      // Add product to cart
      cy.visit('/');
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart-button]').click();
      });

      // Go to cart and remove item
      cy.get('[data-cy=cart-button]').click();
      cy.get('[data-cy=remove-item-button]').click();

      // Cart should be empty
      cy.get('[data-cy=empty-cart]').should('be.visible');
      cy.get('[data-cy=cart-count]').should('contain', '0');
    });

    it('should update item quantity', () => {
      // Add product to cart
      cy.visit('/');
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart-button]').click();
      });

      // Update quantity
      cy.get('[data-cy=cart-button]').click();
      cy.get('[data-cy=quantity-input]').clear().type('2');
      cy.get('[data-cy=update-quantity-button]').click();

      // Check updated total
      cy.get('[data-cy=cart-total]').should('be.visible');
    });
  });

  describe('Checkout Process', () => {
    beforeEach(() => {
      cy.login('testuser@example.com', 'password123');
    });

    it('should proceed to checkout', () => {
      // Add product to cart
      cy.visit('/');
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart-button]').click();
      });

      // Go to checkout
      cy.get('[data-cy=cart-button]').click();
      cy.get('[data-cy=checkout-button]').click();

      // Should be on checkout page
      cy.url().should('include', '/checkout');
      cy.get('[data-cy=checkout-form]').should('be.visible');
      cy.get('[data-cy=shipping-address]').should('be.visible');
      cy.get('[data-cy=payment-method]').should('be.visible');
    });

    it('should place order successfully', () => {
      // Add product to cart and go to checkout
      cy.visit('/');
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart-button]').click();
      });
      cy.get('[data-cy=cart-button]').click();
      cy.get('[data-cy=checkout-button]').click();

      // Fill checkout form
      cy.get('[data-cy=shipping-name]').type('Test User');
      cy.get('[data-cy=shipping-address]').type('123 Test Street');
      cy.get('[data-cy=shipping-city]').type('Test City');
      cy.get('[data-cy=shipping-zip]').type('12345');
      
      // Select payment method
      cy.get('[data-cy=payment-method]').select('credit_card');
      
      // Place order
      cy.get('[data-cy=place-order-button]').click();

      // Should see order confirmation
      cy.url().should('include', '/order-confirmation');
      cy.get('[data-cy=order-success]').should('be.visible');
      cy.get('[data-cy=order-id]').should('be.visible');
    });
  });

  describe('User Profile', () => {
    beforeEach(() => {
      cy.login('testuser@example.com', 'password123');
    });

    it('should view and update profile', () => {
      // Go to profile
      cy.get('[data-cy=user-menu]').click();
      cy.get('[data-cy=profile-link]').click();
      
      cy.url().should('include', '/profile');
      
      // Update profile
      cy.get('[data-cy=profile-name]').clear().type('Updated Name');
      cy.get('[data-cy=save-profile-button]').click();

      // Check success message
      cy.get('[data-cy=success-message]').should('be.visible');
    });

    it('should view order history', () => {
      // Go to orders
      cy.get('[data-cy=user-menu]').click();
      cy.get('[data-cy=orders-link]').click();
      
      cy.url().should('include', '/orders');
      cy.get('[data-cy=orders-list]').should('be.visible');
    });
  });
});
