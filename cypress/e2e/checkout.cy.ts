describe('Checkout Flow', () => {
  beforeEach(() => {
    cy.interceptApiCalls()
    cy.login('testuser@example.com', 'password123')
    cy.seedDb()
  })

  describe('Checkout Process', () => {
    beforeEach(() => {
      // Add products to cart
      cy.visit('/')
      cy.get('[data-cy=product-card]').eq(0).within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      cy.get('[data-cy=product-card]').eq(1).within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
    })

    it('should complete checkout successfully', () => {
      const shippingData = {
        name: 'John Doe',
        address: '123 Main St',
        city: 'New York',
        zip: '10001',
        paymentMethod: 'credit_card'
      }

      cy.checkout(shippingData)
      
      // Wait for order creation
      cy.wait('@createOrder').its('response.statusCode').should('eq', 201)
      
      // Verify order confirmation
      cy.url().should('include', '/order-confirmation')
      cy.get('[data-cy=order-success]').should('be.visible')
      cy.get('[data-cy=order-number]').should('be.visible')
      cy.get('[data-cy=order-total]').should('be.visible')
    })

    it('should validate shipping information', () => {
      cy.get('[data-cy=cart-button]').click()
      cy.get('[data-cy=checkout-button]').click()
      
      const validationRules = {
        'shipping-name': { required: true },
        'shipping-address': { required: true },
        'shipping-city': { required: true },
        'shipping-zip': { required: true }
      }

      cy.testFormValidation('[data-cy=checkout-form]', validationRules)
      
      // Try to submit without filling form
      cy.get('[data-cy=place-order-button]').click()
      
      // Should show validation errors
      cy.get('[data-cy=shipping-name-error]').should('be.visible')
      cy.get('[data-cy=shipping-address-error]').should('be.visible')
    })

    it('should handle different payment methods', () => {
      cy.get('[data-cy=cart-button]').click()
      cy.get('[data-cy=checkout-button]').click()
      
      // Fill shipping info
      cy.get('[data-cy=shipping-name]').type('John Doe')
      cy.get('[data-cy=shipping-address]').type('123 Main St')
      cy.get('[data-cy=shipping-city]').type('New York')
      cy.get('[data-cy=shipping-zip]').type('10001')
      
      // Test different payment methods
      const paymentMethods = ['credit_card', 'paypal', 'apple_pay']
      
      paymentMethods.forEach(method => {
        cy.get('[data-cy=payment-method]').select(method)
        cy.get('[data-cy=place-order-button]').click()
        
        if (method === 'credit_card') {
          // Should show credit card form
          cy.get('[data-cy=credit-card-form]').should('be.visible')
        } else if (method === 'paypal') {
          // Should redirect to PayPal
          cy.url().should('include', 'paypal')
        }
        
        cy.go('back') // Go back to test next method
      })
    })

    it('should calculate shipping costs', () => {
      cy.get('[data-cy=cart-button]').click()
      cy.get('[data-cy=checkout-button]').click()
      
      // Fill shipping info
      cy.get('[data-cy=shipping-name]').type('John Doe')
      cy.get('[data-cy=shipping-address]').type('123 Main St')
      cy.get('[data-cy=shipping-city]').type('New York')
      cy.get('[data-cy=shipping-zip]').type('10001')
      
      // Check shipping options
      cy.get('[data-cy=shipping-options]').should('be.visible')
      cy.get('[data-cy=shipping-option]').should('have.length.greaterThan', 0)
      
      // Select different shipping options
      cy.get('[data-cy=shipping-option]').first().click()
      cy.get('[data-cy=shipping-cost]').should('be.visible')
      
      // Verify total includes shipping
      cy.get('[data-cy=order-total]').should('not.equal', cy.get('[data-cy=cart-subtotal]'))
    })

    it('should apply tax calculations', () => {
      cy.get('[data-cy=cart-button]').click()
      cy.get('[data-cy=checkout-button]').click()
      
      // Fill shipping info
      cy.get('[data-cy=shipping-name]').type('John Doe')
      cy.get('[data-cy=shipping-address]').type('123 Main St')
      cy.get('[data-cy=shipping-city]').type('New York')
      cy.get('[data-cy=shipping-zip]').type('10001')
      
      // Check tax calculation
      cy.get('[data-cy=tax-amount]').should('be.visible')
      cy.get('[data-cy=order-total]').should('be.visible')
      
      // Verify tax is calculated
      cy.get('[data-cy=cart-subtotal]').invoke('text').then((subtotalText) => {
        const subtotal = parseFloat(subtotalText.replace(/[^0-9.]/g, ''))
        
        cy.get('[data-cy=tax-amount]').invoke('text').then((taxText) => {
          const tax = parseFloat(taxText.replace(/[^0-9.]/g, ''))
          expect(tax).to.be.greaterThan(0)
        })
      })
    })
  })

  describe('Order Management', () => {
    beforeEach(() => {
      // Complete a checkout to create an order
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      const shippingData = {
        name: 'John Doe',
        address: '123 Main St',
        city: 'New York',
        zip: '10001',
        paymentMethod: 'credit_card'
      }
      
      cy.checkout(shippingData)
    })

    it('should view order details', () => {
      cy.get('[data-cy=view-order-details]').click()
      
      // Verify order details
      cy.get('[data-cy=order-items]').should('be.visible')
      cy.get('[data-cy=order-item]').should('have.length.greaterThan', 0)
      
      cy.get('[data-cy=order-item]').first().within(() => {
        cy.get('[data-cy=order-item-name]').should('be.visible')
        cy.get('[data-cy=order-item-price]').should('be.visible')
        cy.get('[data-cy=order-item-quantity]').should('be.visible')
      })
      
      cy.get('[data-cy=order-shipping-info]').should('be.visible')
      cy.get('[data-cy=order-payment-info]').should('be.visible')
    })

    it('should track order status', () => {
      cy.get('[data-cy=view-order-details]').click()
      
      // Check order status
      cy.get('[data-cy=order-status]').should('be.visible')
      cy.get('[data-cy=order-status]').should('contain', 'pending')
      
      // Should have tracking information
      cy.get('[data-cy=order-tracking]').should('be.visible')
    })

    it('should cancel order', () => {
      cy.get('[data-cy=view-order-details]').click()
      
      // Cancel order
      cy.get('[data-cy=cancel-order]').click()
      cy.get('[data-cy=confirm-cancel]').click()
      
      cy.get('[data-cy=order-cancelled]').should('be.visible')
      cy.get('[data-cy=order-status]').should('contain', 'cancelled')
    })

    it('should reorder items', () => {
      cy.get('[data-cy=view-order-details]').click()
      
      // Reorder
      cy.get('[data-cy=reorder-items]').click()
      
      // Should add items back to cart
      cy.get('[data-cy=cart-count]').should('be.greaterThan', 0)
      cy.get('[data-cy=reorder-success]').should('be.visible')
    })
  })

  describe('Order History', () => {
    beforeEach(() => {
      // Create multiple orders
      for (let i = 0; i < 3; i++) {
        cy.visit('/')
        cy.get('[data-cy=product-card]').eq(i).within(() => {
          cy.get('[data-cy=add-to-cart]').click()
        })
        
        const shippingData = {
          name: 'John Doe',
          address: '123 Main St',
          city: 'New York',
          zip: '10001',
          paymentMethod: 'credit_card'
        }
        
        cy.checkout(shippingData)
        cy.visit('/account/orders') // Go to orders page
      }
    })

    it('should display order history', () => {
      cy.visit('/account/orders')
      cy.measurePageLoad('Order History')
      
      // Verify orders are displayed
      cy.get('[data-cy=order-list]').should('be.visible')
      cy.get('[data-cy=order-item]').should('have.length', 3)
      
      // Check order item elements
      cy.get('[data-cy=order-item]').first().within(() => {
        cy.get('[data-cy=order-number]').should('be.visible')
        cy.get('[data-cy=order-date]').should('be.visible')
        cy.get('[data-cy=order-status]').should('be.visible')
        cy.get('[data-cy=order-total]').should('be.visible')
      })
    })

    it('should filter orders by status', () => {
      cy.visit('/account/orders')
      
      // Filter by pending orders
      cy.get('[data-cy=order-status-filter]').select('pending')
      cy.get('[data-cy=apply-filter]').click()
      
      // Should show only pending orders
      cy.get('[data-cy=order-item]').each(($el) => {
        cy.wrap($el).find('[data-cy=order-status]').should('contain', 'pending')
      })
    })

    it('should search orders', () => {
      cy.visit('/account/orders')
      
      // Search by order number
      cy.get('[data-cy=order-search]').type('ORD')
      cy.get('[data-cy=search-orders]').click()
      
      // Should show filtered results
      cy.get('[data-cy=order-item]').should('have.length.greaterThan', 0)
    })
  })

  describe('Checkout Performance', () => {
    it('should load checkout page quickly', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      cy.get('[data-cy=cart-button]').click()
      cy.get('[data-cy=checkout-button]').click()
      
      cy.measurePageLoad('Checkout')
      cy.get('[data-cy=checkout-form]').should('be.visible')
    })

    it('should handle large orders efficiently', () => {
      // Add many items to cart
      for (let i = 0; i < 10; i++) {
        cy.get('[data-cy=product-card]').eq(i % 3).within(() => {
          cy.get('[data-cy=add-to-cart]').click()
        })
      }
      
      cy.get('[data-cy=cart-button]').click()
      cy.get('[data-cy=checkout-button]').click()
      
      // Should still be responsive
      cy.get('[data-cy=checkout-form]').should('be.visible')
      cy.get('[data-cy=order-summary]').should('be.visible')
    })
  })

  describe('Checkout Accessibility', () => {
    it('should be keyboard navigable', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      cy.get('[data-cy=cart-button]').click()
      cy.get('[data-cy=checkout-button]').click()
      
      // Tab through form fields
      cy.get('[data-cy=shipping-name]').focus()
      cy.get('body').tab()
      cy.get('[data-cy=shipping-address]').should('be.focused')
    })

    it('should have proper ARIA labels', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      cy.get('[data-cy=cart-button]').click()
      cy.get('[data-cy=checkout-button]').click()
      
      // Check ARIA labels
      cy.get('[data-cy=checkout-form]').should('have.attr', 'aria-label')
      cy.get('[data-cy=place-order-button]').should('have.attr', 'aria-label')
    })
  })

  describe('Error Handling', () => {
    it('should handle payment failures', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      cy.get('[data-cy=cart-button]').click()
      cy.get('[data-cy=checkout-button]').click()
      
      // Fill form with invalid payment
      cy.get('[data-cy=shipping-name]').type('John Doe')
      cy.get('[data-cy=shipping-address]').type('123 Main St')
      cy.get('[data-cy=shipping-city]').type('New York')
      cy.get('[data-cy=shipping-zip]').type('10001')
      cy.get('[data-cy=payment-method]').select('credit_card')
      
      // Mock payment failure
      cy.intercept('POST', `${Cypress.env('apiUrl')}/orders`, {
        statusCode: 400,
        body: { error: 'Payment failed' }
      }).as('paymentFailed')
      
      cy.get('[data-cy=place-order-button]').click()
      
      cy.wait('@paymentFailed')
      cy.get('[data-cy=payment-error]').should('be.visible')
      cy.get('[data-cy=payment-error]').should('contain', 'Payment failed')
    })

    it('should handle network errors', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      cy.get('[data-cy=cart-button]').click()
      cy.get('[data-cy=checkout-button]').click()
      
      // Mock network error
      cy.intercept('POST', `${Cypress.env('apiUrl')}/orders`, {
        forceNetworkError: true
      }).as('networkError')
      
      cy.get('[data-cy=shipping-name]').type('John Doe')
      cy.get('[data-cy=shipping-address]').type('123 Main St')
      cy.get('[data-cy=shipping-city]').type('New York')
      cy.get('[data-cy=shipping-zip]').type('10001')
      cy.get('[data-cy=place-order-button]').click()
      
      cy.wait('@networkError')
      cy.get('[data-cy=network-error]').should('be.visible')
    })
  })
})
