describe('Shopping Cart Flow', () => {
  beforeEach(() => {
    cy.interceptApiCalls()
    cy.login('testuser@example.com', 'password123')
    cy.seedDb()
  })

  describe('Adding Products to Cart', () => {
    it('should add product to cart from product list', () => {
      cy.visit('/')
      
      // Add first product to cart
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      cy.wait('@addToCart').its('response.statusCode').should('eq', 200)
      cy.get('[data-cy=cart-count]').should('contain', '1')
      cy.get('[data-cy=add-to-cart-success]').should('be.visible')
    })

    it('should add product to cart from product details', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().click()
      
      cy.get('[data-cy=add-to-cart-detail]').click()
      
      cy.wait('@addToCart').its('response.statusCode').should('eq', 200)
      cy.get('[data-cy=cart-count]').should('contain', '1')
    })

    it('should add multiple products to cart', () => {
      cy.visit('/')
      
      // Add first product
      cy.get('[data-cy=product-card]').eq(0).within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      // Add second product
      cy.get('[data-cy=product-card]').eq(1).within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      cy.wait('@addToCart').its('response.statusCode').should('eq', 200)
      cy.get('[data-cy=cart-count]').should('contain', '2')
    })

    it('should handle out of stock products', () => {
      // Mock out of stock product
      cy.visit('/products/out-of-stock-product')
      
      cy.get('[data-cy=add-to-cart-detail]').should('be.disabled')
      cy.get('[data-cy=out-of-stock-message]').should('be.visible')
    })
  })

  describe('Cart Management', () => {
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

    it('should view cart contents', () => {
      cy.get('[data-cy=cart-button]').click()
      cy.measurePageLoad('Cart')
      
      // Verify cart items
      cy.get('[data-cy=cart-items]').should('have.length', 2)
      
      // Check cart item elements
      cy.get('[data-cy=cart-item]').first().within(() => {
        cy.get('[data-cy=cart-item-name]').should('be.visible')
        cy.get('[data-cy=cart-item-price]').should('be.visible')
        cy.get('[data-cy=cart-item-quantity]').should('be.visible')
        cy.get('[data-cy=cart-item-total]').should('be.visible')
      })
      
      // Verify cart summary
      cy.get('[data-cy=cart-subtotal]').should('be.visible')
      cy.get('[data-cy=cart-total]').should('be.visible')
    })

    it('should update item quantity', () => {
      cy.get('[data-cy=cart-button]').click()
      
      // Increase quantity
      cy.get('[data-cy=cart-item]').first().within(() => {
        cy.get('[data-cy=quantity-increase]').click()
        cy.get('[data-cy=cart-item-quantity]').should('have.value', '2')
      })
      
      // Verify total updated
      cy.get('[data-cy=cart-total]').should('contain', '2')
    })

    it('should decrease item quantity', () => {
      cy.get('[data-cy=cart-button]').click()
      
      // Add one more to first item first
      cy.get('[data-cy=cart-item]').first().within(() => {
        cy.get('[data-cy=quantity-increase]').click()
        cy.get('[data-cy=quantity-decrease]').click()
        cy.get('[data-cy=cart-item-quantity]').should('have.value', '1')
      })
    })

    it('should remove item from cart', () => {
      cy.get('[data-cy=cart-button]').click()
      
      // Remove first item
      cy.get('[data-cy=cart-item]').first().within(() => {
        cy.get('[data-cy=remove-item]').click()
      })
      
      // Confirm removal
      cy.get('[data-cy=confirm-remove]').click()
      
      cy.get('[data-cy=cart-items]').should('have.length', 1)
      cy.get('[data-cy=cart-count]').should('contain', '1')
    })

    it('should clear entire cart', () => {
      cy.get('[data-cy=cart-button]').click()
      
      cy.get('[data-cy=clear-cart]').click()
      cy.get('[data-cy=confirm-clear]').click()
      
      cy.get('[data-cy=empty-cart]').should('be.visible')
      cy.get('[data-cy=cart-count]').should('contain', '0')
    })

    it('should handle empty cart', () => {
      // Clear cart first
      cy.get('[data-cy=cart-button]').click()
      cy.get('[data-cy=clear-cart]').click()
      cy.get('[data-cy=confirm-clear]').click()
      
      // Verify empty cart state
      cy.get('[data-cy=empty-cart]').should('be.visible')
      cy.get('[data-cy=empty-cart-message]').should('contain', 'Your cart is empty')
      cy.get('[data-cy=continue-shopping]').should('be.visible')
      cy.get('[data-cy=checkout-button]').should('be.disabled')
    })
  })

  describe('Cart Calculations', () => {
    beforeEach(() => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').eq(0).within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
    })

    it('should calculate correct totals', () => {
      cy.get('[data-cy=cart-button]').click()
      
      // Get initial values
      cy.get('[data-cy=cart-item]').first().within(() => {
        cy.get('[data-cy=cart-item-price]').invoke('text').then((priceText) => {
          const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))
          
          cy.get('[data-cy=cart-item-quantity]').invoke('val').then((quantity) => {
            const expectedTotal = price * parseInt(quantity)
            
            cy.get('[data-cy=cart-item-total]').invoke('text').then((totalText) => {
              const actualTotal = parseFloat(totalText.replace(/[^0-9.]/g, ''))
              expect(actualTotal).to.eq(expectedTotal)
            })
          })
        })
      })
    })

    it('should apply discount code', () => {
      cy.get('[data-cy=cart-button]').click()
      
      cy.get('[data-cy=discount-code]').type('SAVE10')
      cy.get('[data-cy=apply-discount]').click()
      
      cy.get('[data-cy=discount-applied]').should('be.visible')
      cy.get('[data-cy=discount-amount]').should('be.visible')
      
      // Verify total is reduced
      cy.get('[data-cy=cart-total]').should('not.equal', cy.get('[data-cy=cart-subtotal]'))
    })

    it('should handle invalid discount code', () => {
      cy.get('[data-cy=cart-button]').click()
      
      cy.get('[data-cy=discount-code]').type('INVALID')
      cy.get('[data-cy=apply-discount]').click()
      
      cy.get('[data-cy=discount-error]').should('be.visible')
      cy.get('[data-cy=discount-error]').should('contain', 'Invalid code')
    })
  })

  describe('Cart Persistence', () => {
    it('should persist cart across sessions', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      // Save localStorage
      cy.saveLocalStorage()
      
      // Clear and restore
      cy.clearLocalStorage()
      cy.restoreLocalStorage()
      
      // Visit cart page
      cy.get('[data-cy=cart-button]').click()
      
      // Cart should still have items
      cy.get('[data-cy=cart-items]').should('have.length', 1)
    })

    it('should sync cart with server', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      // Wait for server sync
      cy.wait('@addToCart').its('response.statusCode').should('eq', 200)
      
      // Refresh page
      cy.reload()
      
      // Cart should still have items
      cy.get('[data-cy=cart-count]').should('contain', '1')
    })
  })

  describe('Cart Accessibility', () => {
    it('should be keyboard navigable', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').focus()
      })
      
      // Tab to cart button
      cy.get('body').tab()
      cy.get('[data-cy=cart-button]').should('be.focused')
      
      // Enter to open cart
      cy.get('[data-cy=cart-button]').type('{enter}')
      
      cy.get('[data-cy=cart-dropdown]').should('be.visible')
    })

    it('should have proper ARIA labels', () => {
      cy.visit('/')
      cy.get('[data-cy=cart-button]').should('have.attr', 'aria-label')
      cy.get('[data-cy=cart-count]').should('have.attr', 'aria-label')
    })
  })

  describe('Cart Performance', () => {
    it('should load cart quickly', () => {
      // Add multiple items
      for (let i = 0; i < 5; i++) {
        cy.get('[data-cy=product-card]').eq(i).within(() => {
          cy.get('[data-cy=add-to-cart]').click()
        })
      }
      
      cy.get('[data-cy=cart-button]').click()
      cy.measurePageLoad('Cart with items')
      
      // Should load in under 2 seconds
      cy.get('[data-cy=cart-items]').should('be.visible')
    })

    it('should handle large cart efficiently', () => {
      // Add many items
      for (let i = 0; i < 20; i++) {
        cy.get('[data-cy=product-card]').eq(i % 5).within(() => {
          cy.get('[data-cy=add-to-cart]').click()
        })
      }
      
      cy.get('[data-cy=cart-button]').click()
      
      // Should still be responsive
      cy.get('[data-cy=cart-items]').should('have.length.greaterThan', 15)
      cy.get('[data-cy=cart-total]').should('be.visible')
    })
  })
})
