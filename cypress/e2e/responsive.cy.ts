describe('Responsive Design & Cross-Device Testing', () => {
  beforeEach(() => {
    cy.interceptApiCalls()
    cy.login('testuser@example.com', 'password123')
    cy.seedDb()
  })

  describe('Mobile Viewport Testing', () => {
    beforeEach(() => {
      cy.testMobileView()
    })

    it('should display mobile navigation', () => {
      cy.visit('/')
      
      // Mobile navigation should be visible
      cy.get('[data-cy=mobile-menu-toggle]').should('be.visible')
      cy.get('[data-cy=mobile-menu]').should('not.be.visible')
      
      // Toggle mobile menu
      cy.get('[data-cy=mobile-menu-toggle]').click()
      cy.get('[data-cy=mobile-menu]').should('be.visible')
      
      // Check mobile menu items
      cy.get('[data-cy=mobile-menu]').within(() => {
        cy.get('[data-cy=nav-home]').should('be.visible')
        cy.get('[data-cy=nav-products]').should('be.visible')
        cy.get('[data-cy=nav-cart]').should('be.visible')
      })
    })

    it('should display products in mobile layout', () => {
      cy.visit('/')
      
      // Products should be in single column
      cy.get('[data-cy=product-grid]').should('have.class', 'mobile-grid')
      cy.get('[data-cy=product-card]').should('have.css', 'width').and('match', /\d+px/)
      
      // Mobile product card elements
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=product-name]').should('be.visible')
        cy.get('[data-cy=product-price]').should('be.visible')
        cy.get('[data-cy=add-to-cart]').should('be.visible')
      })
    })

    it('should handle mobile cart', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      // Mobile cart should be accessible
      cy.get('[data-cy=mobile-cart-button]').should('be.visible')
      cy.get('[data-cy=mobile-cart-button]').click()
      
      cy.get('[data-cy=mobile-cart]').should('be.visible')
      cy.get('[data-cy=mobile-cart-items]').should('have.length', 1)
    })

    it('should handle mobile checkout', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      cy.get('[data-cy=mobile-cart-button]').click()
      cy.get('[data-cy=mobile-checkout-button]').click()
      
      // Mobile checkout form
      cy.get('[data-cy=mobile-checkout-form]').should('be.visible')
      cy.get('[data-cy=shipping-name]').should('be.visible')
      cy.get('[data-cy=place-order-button]').should('be.visible')
    })

    it('should handle mobile search', () => {
      cy.visit('/')
      
      // Mobile search should be collapsible
      cy.get('[data-cy=mobile-search-toggle]').should('be.visible')
      cy.get('[data-cy=mobile-search]').should('not.be.visible')
      
      cy.get('[data-cy=mobile-search-toggle]').click()
      cy.get('[data-cy=mobile-search]').should('be.visible')
      cy.get('[data-cy=search-input]').should('be.visible')
    })
  })

  describe('Tablet Viewport Testing', () => {
    beforeEach(() => {
      cy.testTabletView()
    })

    it('should display tablet layout', () => {
      cy.visit('/')
      
      // Should show sidebar navigation
      cy.get('[data-cy=sidebar]').should('be.visible')
      cy.get('[data-cy=main-content]').should('be.visible')
      
      // Products should be in 2-3 columns
      cy.get('[data-cy=product-grid]').should('have.class', 'tablet-grid')
    })

    it('should handle tablet cart', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      // Tablet cart should be slide-out panel
      cy.get('[data-cy=cart-button]').click()
      cy.get('[data-cy=tablet-cart]').should('be.visible')
      cy.get('[data-cy=tablet-cart]').should('have.class', 'slide-out')
    })

    it('should display tablet navigation', () => {
      cy.visit('/')
      
      // Should show horizontal navigation
      cy.get('[data-cy=tablet-nav]').should('be.visible')
      cy.get('[data-cy=nav-item]').should('have.length.greaterThan', 3)
    })
  })

  describe('Desktop Viewport Testing', () => {
    beforeEach(() => {
      cy.testDesktopView()
    })

    it('should display desktop layout', () => {
      cy.visit('/')
      
      // Should show full navigation
      cy.get('[data-cy=main-navigation]').should('be.visible')
      cy.get('[data-cy=desktop-header]').should('be.visible')
      
      // Products should be in multiple columns
      cy.get('[data-cy=product-grid]').should('have.class', 'desktop-grid')
      cy.get('[data-cy=product-grid]').should('have.css', 'grid-template-columns')
    })

    it('should handle desktop cart', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      // Desktop cart should be dropdown
      cy.get('[data-cy=cart-button]').click()
      cy.get('[data-cy=desktop-cart-dropdown]').should('be.visible')
      cy.get('[data-cy=desktop-cart-dropdown]').should('have.class', 'dropdown')
    })

    it('should display desktop product details', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().click()
      
      // Desktop product details should have sidebar
      cy.get('[data-cy=product-details-sidebar]').should('be.visible')
      cy.get('[data-cy=product-details-main]').should('be.visible')
      cy.get('[data-cy=product-image-gallery]').should('be.visible')
    })
  })

  describe('Cross-Device Functionality', () => {
    it('should maintain cart state across viewports', () => {
      // Start on desktop
      cy.testDesktopView()
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      // Switch to mobile
      cy.testMobileView()
      cy.get('[data-cy=mobile-cart-button]').should('contain', '1')
      
      // Switch to tablet
      cy.testTabletView()
      cy.get('[data-cy=cart-button]').should('contain', '1')
    })

    it('should handle responsive images', () => {
      cy.testDesktopView()
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=product-image]').should('be.visible')
        cy.get('[data-cy=product-image]').should('have.attr', 'src')
      })
      
      cy.testMobileView()
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=product-image]').should('be.visible')
        // Should load different image size
        cy.get('[data-cy=product-image]').invoke('attr', 'src').should('include', 'mobile')
      })
    })

    it('should handle responsive typography', () => {
      cy.testDesktopView()
      cy.visit('/')
      
      cy.get('[data-cy=product-name]').first().invoke('css', 'font-size').then((desktopSize) => {
        cy.testMobileView()
        cy.get('[data-cy=product-name]').first().invoke('css', 'font-size').then((mobileSize) => {
          expect(parseInt(mobileSize)).to.be.lessThan(parseInt(desktopSize))
        })
      })
    })
  })

  describe('Touch Interactions', () => {
    beforeEach(() => {
      cy.testMobileView()
    })

    it('should handle swipe gestures', () => {
      cy.visit('/')
      
      // Test product carousel swipe
      cy.get('[data-cy=product-carousel]').should('be.visible')
      
      // Swipe left
      cy.get('[data-cy=product-carousel]').swipe('left')
      cy.get('[data-cy=product-carousel]').should('have.attr', 'data-current-slide').and('not.eq', '0')
      
      // Swipe right
      cy.get('[data-cy=product-carousel]').swipe('right')
      cy.get('[data-cy=product-carousel]').should('have.attr', 'data-current-slide').and('eq', '0')
    })

    it('should handle pull-to-refresh', () => {
      cy.visit('/')
      
      // Pull down to refresh
      cy.get('[data-cy=product-grid]').swipe('down', { distance: 100 })
      cy.get('[data-cy=refresh-indicator]').should('be.visible')
      
      // Should refresh products
      cy.wait('@getProducts').its('response.statusCode').should('eq', 200)
    })

    it('should handle long press', () => {
      cy.visit('/')
      
      // Long press on product
      cy.get('[data-cy=product-card]').first().longpress()
      cy.get('[data-cy=product-context-menu]').should('be.visible')
      cy.get('[data-cy=add-to-wishlist]').should('be.visible')
      cy.get('[data-cy=share-product]').should('be.visible')
    })
  })

  describe('Device-Specific Features', () => {
    it('should handle geolocation on mobile', () => {
      cy.testMobileView()
      cy.visit('/')
      
      // Mock geolocation
      cy.window().then((win) => {
        cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((success) => {
          success({
            coords: {
              latitude: 40.7128,
              longitude: -74.0060
            }
          })
        })
      })
      
      // Should show location-based features
      cy.get('[data-cy=location-based-products]').should('be.visible')
    })

    it('should handle camera upload on mobile', () => {
      cy.testMobileView()
      cy.visit('/profile')
      
      // Test camera upload
      cy.get('[data-cy=upload-avatar]').should('be.visible')
      cy.get('[data-cy=camera-upload]').should('be.visible')
      
      // Mock camera access
      cy.get('[data-cy=camera-upload]').click()
      cy.get('[data-cy=camera-modal]').should('be.visible')
    })

    it('should handle push notifications', () => {
      cy.testMobileView()
      cy.visit('/')
      
      // Mock push notifications
      cy.window().then((win) => {
        cy.stub(win.Notification, 'requestPermission').resolves('granted')
        cy.stub(win.Notification, 'constructor').callsFake((title, options) => {
          return {
            title,
            body: options.body,
            icon: options.icon
          }
        })
      })
      
      // Should request notification permission
      cy.get('[data-cy=notification-permission]').should('be.visible')
    })
  })

  describe('Performance Across Devices', () => {
    it('should load quickly on mobile', () => {
      cy.testMobileView()
      cy.visit('/')
      cy.measurePageLoad('Mobile Homepage')
      
      // Should load in under 3 seconds
      cy.get('[data-cy=product-grid]').should('be.visible')
    })

    it('should handle memory efficiently on mobile', () => {
      cy.testMobileView()
      
      // Add many products to cart
      for (let i = 0; i < 20; i++) {
        cy.get('[data-cy=product-card]').eq(i % 5).within(() => {
          cy.get('[data-cy=add-to-cart]').click()
        })
      }
      
      // Should still be responsive
      cy.get('[data-cy=mobile-cart-button]').click()
      cy.get('[data-cy=mobile-cart-items]').should('have.length', 20)
    })

    it('should handle network conditions', () => {
      cy.testMobileView()
      
      // Simulate slow network
      cy.intercept('GET', `${Cypress.env('apiUrl')}/products*`, {
        delay: 2000
      }).as('slowProducts')
      
      cy.visit('/')
      
      // Should show loading state
      cy.get('[data-cy=loading-skeleton]').should('be.visible')
      
      cy.wait('@slowProducts')
      cy.get('[data-cy=product-grid]').should('be.visible')
    })
  })

  describe('Accessibility Across Devices', () => {
    it('should be accessible on mobile', () => {
      cy.testMobileView()
      cy.visit('/')
      cy.checkAccessibility()
    })

    it('should be accessible on tablet', () => {
      cy.testTabletView()
      cy.visit('/')
      cy.checkAccessibility()
    })

    it('should be accessible on desktop', () => {
      cy.testDesktopView()
      cy.visit('/')
      cy.checkAccessibility()
    })

    it('should handle screen readers', () => {
      cy.testMobileView()
      cy.visit('/')
      
      // Check ARIA labels
      cy.get('[data-cy=product-card]').first().should('have.attr', 'aria-label')
      cy.get('[data-cy=add-to-cart]').should('have.attr', 'aria-label')
      cy.get('[data-cy=mobile-menu-toggle]').should('have.attr', 'aria-label')
    })

    it('should handle keyboard navigation on mobile', () => {
      cy.testMobileView()
      cy.visit('/')
      
      // Should be keyboard navigable
      cy.get('[data-cy=product-card]').first().focus()
      cy.get('[data-cy=product-card]').first().should('be.focused')
      
      cy.get('[data-cy=add-to-cart]').first().focus()
      cy.get('[data-cy=add-to-cart]').first().should('be.focused')
    })
  })
})
