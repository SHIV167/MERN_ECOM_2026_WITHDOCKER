describe('Accessibility Testing', () => {
  beforeEach(() => {
    cy.interceptApiCalls()
    cy.login('testuser@example.com', 'password123')
    cy.seedDb()
  })

  describe('WCAG Compliance', () => {
    it('should meet WCAG 2.1 AA standards on homepage', () => {
      cy.visit('/')
      cy.injectAxe()
      cy.checkA11y(null, {
        rules: {
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'focus-management': { enabled: true },
          'aria-labels': { enabled: true },
          'heading-order': { enabled: true },
          'landmark-roles': { enabled: true }
        }
      })
    })

    it('should meet WCAG 2.1 AA standards on product pages', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().click()
      cy.injectAxe()
      cy.checkA11y(null, {
        rules: {
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'focus-management': { enabled: true },
          'aria-labels': { enabled: true }
        }
      })
    })

    it('should meet WCAG 2.1 AA standards on checkout', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      cy.get('[data-cy=cart-button]').click()
      cy.get('[data-cy=checkout-button]').click()
      
      cy.injectAxe()
      cy.checkA11y(null, {
        rules: {
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'focus-management': { enabled: true },
          'form-labels': { enabled: true },
          'error-messages': { enabled: true }
        }
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should be fully keyboard navigable', () => {
      cy.visit('/')
      
      // Tab through main navigation
      cy.get('body').tab()
      cy.get('[data-cy=nav-home]').should('be.focused')
      
      cy.get('body').tab()
      cy.get('[data-cy=nav-products]').should('be.focused')
      
      cy.get('body').tab()
      cy.get('[data-cy=cart-button]').should('be.focused')
      
      // Navigate to products
      cy.get('[data-cy=nav-products]').type('{enter}')
      cy.url().should('include', '/products')
      
      // Navigate to product details
      cy.get('body').tab()
      cy.get('[data-cy=product-card]').first().should('be.focused')
      
      cy.get('[data-cy=product-card]').first().type('{enter}')
      cy.url().should('include', '/products/')
    })

    it('should handle keyboard interactions with forms', () => {
      cy.visit('/login')
      
      // Tab through form fields
      cy.get('[data-cy=email]').focus()
      cy.get('[data-cy=email]').should('be.focused')
      
      cy.get('body').tab()
      cy.get('[data-cy=password]').should('be.focused')
      
      cy.get('body').tab()
      cy.get('[data-cy=login-button]').should('be.focused')
      
      // Submit with Enter
      cy.get('[data-cy=login-button]').type('{enter}')
      
      // Should show validation errors for empty fields
      cy.get('[data-cy=email-error]').should('be.visible')
      cy.get('[data-cy=password-error]').should('be.visible')
    })

    it('should handle keyboard interactions with cart', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').focus()
        cy.get('[data-cy=add-to-cart]').type('{enter}')
      })
      
      // Navigate to cart
      cy.get('[data-cy=cart-button]').focus()
      cy.get('[data-cy=cart-button]').type('{enter}')
      
      cy.get('[data-cy=cart-dropdown]').should('be.visible')
      
      // Navigate cart items
      cy.get('body').tab()
      cy.get('[data-cy=cart-item]').first().should('be.focused')
    })

    it('should handle escape key', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().click()
      
      // Close modal with escape
      cy.get('[data-cy=product-modal]').should('be.visible')
      cy.get('body').type('{esc}')
      cy.get('[data-cy=product-modal]').should('not.be.visible')
    })
  })

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels', () => {
      cy.visit('/')
      
      // Check navigation ARIA labels
      cy.get('[data-cy=main-navigation]').should('have.attr', 'aria-label', 'Main navigation')
      cy.get('[data-cy=cart-button]').should('have.attr', 'aria-label')
      cy.get('[data-cy=search-input]').should('have.attr', 'aria-label', 'Search products')
      
      // Check product ARIA labels
      cy.get('[data-cy=product-card]').first().should('have.attr', 'aria-label')
      cy.get('[data-cy=add-to-cart]').first().should('have.attr', 'aria-label')
    })

    it('should have proper heading structure', () => {
      cy.visit('/')
      
      // Check heading hierarchy
      cy.get('h1').should('have.length', 1)
      cy.get('h1').should('contain', 'Products')
      
      cy.get('h2').should('have.length.greaterThan', 0)
      cy.get('h2').first().should('contain', 'Featured Products')
    })

    it('should have proper landmark roles', () => {
      cy.visit('/')
      
      // Check landmarks
      cy.get('main').should('have.attr', 'role', 'main')
      cy.get('nav').should('have.attr', 'role', 'navigation')
      cy.get('header').should('have.attr', 'role', 'banner')
      cy.get('footer').should('have.attr', 'role', 'contentinfo')
    })

    it('should have proper form labels', () => {
      cy.visit('/login')
      
      // Check form labels
      cy.get('[data-cy=email]').should('have.attr', 'aria-label')
      cy.get('[data-cy=password]').should('have.attr', 'aria-label')
      
      // Check error messages
      cy.get('[data-cy=login-button]').click()
      cy.get('[data-cy=email-error]').should('have.attr', 'role', 'alert')
      cy.get('[data-cy=password-error]').should('have.attr', 'role', 'alert')
    })

    it('should announce dynamic content changes', () => {
      cy.visit('/')
      
      // Add to cart should announce change
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      cy.get('[data-cy=cart-count]').should('have.attr', 'aria-live', 'polite')
      cy.get('[data-cy=add-to-cart-success]').should('have.attr', 'role', 'status')
    })
  })

  describe('Color Contrast', () => {
    it('should have sufficient color contrast for text', () => {
      cy.visit('/')
      
      // Check main text contrast
      cy.get('[data-cy=product-name]').first().should('have.css', 'color')
      cy.get('[data-cy=product-price]').first().should('have.css', 'color')
      
      // Check button contrast
      cy.get('[data-cy=add-to-cart]').first().should('have.css', 'background-color')
      cy.get('[data-cy=add-to-cart]').first().should('have.css', 'color')
    })

    it('should have sufficient color contrast for links', () => {
      cy.visit('/')
      
      // Check link contrast
      cy.get('a').first().should('have.css', 'color')
      cy.get('a').first().should('have.css', 'background-color')
    })

    it('should handle dark mode contrast', () => {
      cy.visit('/')
      
      // Test dark mode
      cy.get('[data-cy=theme-toggle]').click()
      cy.get('body').should('have.class', 'dark')
      
      // Check dark mode contrast
      cy.get('[data-cy=product-name]').first().should('have.css', 'color')
      cy.get('[data-cy=add-to-cart]').first().should('have.css', 'background-color')
    })
  })

  describe('Focus Management', () => {
    it('should manage focus properly', () => {
      cy.visit('/')
      
      // Focus should be visible
      cy.get('[data-cy=product-card]').first().focus()
      cy.get('[data-cy=product-card]').first().should('be.focused')
      cy.get('[data-cy=product-card]').first().should('have.css', 'outline')
    })

    it('should trap focus in modals', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().click()
      
      // Focus should be trapped in modal
      cy.get('[data-cy=product-modal]').should('be.visible')
      cy.get('[data-cy=modal-close]').should('be.focused')
      
      // Tab should stay within modal
      cy.get('body').tab()
      cy.get('[data-cy=modal-content]').should('be.focused')
    })

    it('should return focus after modal close', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().focus()
      
      // Open modal
      cy.get('[data-cy=product-card]').first().type('{enter}')
      cy.get('[data-cy=product-modal]').should('be.visible')
      
      // Close modal
      cy.get('[data-cy=modal-close]').type('{enter}')
      cy.get('[data-cy=product-modal]').should('not.be.visible')
      
      // Focus should return to trigger
      cy.get('[data-cy=product-card]').first().should('be.focused')
    })

    it('should handle focus skip links', () => {
      cy.visit('/')
      
      // Skip link should be available
      cy.get('[data-cy=skip-to-content]').should('be.visible')
      cy.get('[data-cy=skip-to-content]').should('have.attr', 'href', '#main-content')
      
      // Skip link should work
      cy.get('[data-cy=skip-to-content]').click()
      cy.get('#main-content').should('be.focused')
    })
  })

  describe('Alternative Text', () => {
    it('should have alt text for images', () => {
      cy.visit('/')
      
      // Check product images
      cy.get('[data-cy=product-image]').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt')
        cy.wrap($img).invoke('attr', 'alt').should('not.be.empty')
      })
    })

    it('should have descriptive alt text for functional images', () => {
      cy.visit('/')
      
      // Check functional images
      cy.get('[data-cy=cart-icon]').should('have.attr', 'alt', 'Shopping cart')
      cy.get('[data-cy=search-icon]').should('have.attr', 'alt', 'Search')
      cy.get('[data-cy=menu-icon]').should('have.attr', 'alt', 'Menu')
    })

    it('should handle decorative images', () => {
      cy.visit('/')
      
      // Decorative images should have empty alt
      cy.get('[data-cy=decorative-image]').should('have.attr', 'alt', '')
    })
  })

  describe('Form Accessibility', () => {
    it('should have proper form labels', () => {
      cy.visit('/login')
      
      // Check form labels
      cy.get('[data-cy=email]').should('have.attr', 'aria-label', 'Email address')
      cy.get('[data-cy=password]').should('have.attr', 'aria-label', 'Password')
      
      // Check required fields
      cy.get('[data-cy=email]').should('have.attr', 'required')
      cy.get('[data-cy=password]').should('have.attr', 'required')
    })

    it('should have proper error messages', () => {
      cy.visit('/login')
      
      // Submit empty form
      cy.get('[data-cy=login-button]').click()
      
      // Check error messages
      cy.get('[data-cy=email-error]').should('be.visible')
      cy.get('[data-cy=email-error]').should('have.attr', 'role', 'alert')
      cy.get('[data-cy=email-error]').should('have.attr', 'aria-live', 'polite')
      
      cy.get('[data-cy=password-error]').should('be.visible')
      cy.get('[data-cy=password-error]').should('have.attr', 'role', 'alert')
    })

    it('should have proper field descriptions', () => {
      cy.visit('/register')
      
      // Check field descriptions
      cy.get('[data-cy=password]').should('have.attr', 'aria-describedby')
      cy.get('[data-cy=password-help]').should('be.visible')
    })

    it('should handle form validation properly', () => {
      cy.visit('/register')
      
      // Test validation
      cy.get('[data-cy=password]').type('123')
      cy.get('[data-cy=password]').blur()
      
      cy.get('[data-cy=password-error]').should('be.visible')
      cy.get('[data-cy=password-error]').should('contain', 'at least 6 characters')
      cy.get('[data-cy=password-error]').should('have.attr', 'role', 'alert')
    })
  })

  describe('Mobile Accessibility', () => {
    beforeEach(() => {
      cy.viewport(375, 667)
    })

    it('should be accessible on mobile', () => {
      cy.visit('/')
      cy.injectAxe()
      cy.checkA11y(null, {
        rules: {
          'touch-target-size': { enabled: true },
          'mobile-gestures': { enabled: true }
        }
      })
    })

    it('should have appropriate touch targets', () => {
      cy.visit('/')
      
      // Check touch target sizes
      cy.get('[data-cy=add-to-cart]').first().should('have.css', 'min-height').and('match', /\d+px/)
      cy.get('[data-cy=cart-button]').should('have.css', 'min-height').and('match', /\d+px/)
      
      // Touch targets should be at least 44px
      cy.get('[data-cy=add-to-cart]').first().invoke('css', 'min-height').then((height) => {
        expect(parseInt(height)).to.be.gte(44)
      })
    })

    it('should handle mobile gestures', () => {
      cy.visit('/')
      
      // Should support swipe navigation
      cy.get('[data-cy=mobile-menu-toggle]').should('be.visible')
      cy.get('[data-cy=mobile-menu-toggle]').click()
      cy.get('[data-cy=mobile-menu]').should('be.visible')
    })
  })

  describe('Performance and Accessibility', () => {
    it('should maintain accessibility with lazy loading', () => {
      cy.visit('/')
      
      // Check lazy loaded images
      cy.get('[data-cy=product-image]').each(($img) => {
        cy.wrap($img).should('have.attr', 'loading', 'lazy')
        cy.wrap($img).should('have.attr', 'alt')
      })
    })

    it('should handle accessibility with dynamic content', () => {
      cy.visit('/')
      
      // Add to cart
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      // Check dynamic content accessibility
      cy.get('[data-cy=cart-count]').should('have.attr', 'aria-live', 'polite')
      cy.get('[data-cy=add-to-cart-success]').should('have.attr', 'role', 'status')
    })
  })
})
