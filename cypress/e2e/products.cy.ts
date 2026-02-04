describe('Product Management Flow', () => {
  beforeEach(() => {
    cy.interceptApiCalls()
  })

  describe('Product Browsing', () => {
    it('should display products on homepage', () => {
      cy.visit('/')
      cy.measurePageLoad('Homepage')
      
      // Check if products are displayed
      cy.get('[data-cy=product-grid]').should('be.visible')
      cy.get('[data-cy=product-card]').should('have.length.greaterThan', 0)
      
      // Check product card elements
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=product-name]').should('be.visible')
        cy.get('[data-cy=product-price]').should('be.visible')
        cy.get('[data-cy=product-image]').should('be.visible')
        cy.get('[data-cy=add-to-cart]').should('be.visible')
      })
    })

    it('should load products from API', () => {
      cy.visit('/')
      cy.wait('@getProducts').its('response.statusCode').should('eq', 200)
      
      cy.get('[data-cy=product-card]').should('have.length.greaterThan', 0)
    })

    it('should handle empty product list', () => {
      // Clear products and test empty state
      cy.clearDb()
      cy.visit('/')
      
      cy.get('[data-cy=empty-products]').should('be.visible')
      cy.get('[data-cy=empty-products-message]').should('contain', 'No products available')
    })
  })

  describe('Product Search', () => {
    beforeEach(() => {
      // Seed products for testing
      cy.seedDb()
    })

    it('should search products by name', () => {
      cy.visit('/')
      cy.searchProducts('laptop')
      
      cy.wait('@getProducts').its('response.statusCode').should('eq', 200)
      cy.url().should('include', 'search=laptop')
      
      // Verify search results
      cy.get('[data-cy=product-card]').each(($el) => {
        cy.wrap($el).find('[data-cy=product-name]').should('contain.text', 'laptop', { matchCase: false })
      })
    })

    it('should show no results for invalid search', () => {
      cy.visit('/')
      cy.searchProducts('nonexistentproduct123')
      
      cy.get('[data-cy=no-search-results]').should('be.visible')
      cy.get('[data-cy=no-results-message]').should('contain', 'No products found')
    })

    it('should clear search results', () => {
      cy.visit('/')
      cy.searchProducts('laptop')
      
      cy.get('[data-cy=clear-search]').click()
      cy.url().should('not.include', 'search=')
      cy.get('[data-cy=product-grid]').should('be.visible')
    })
  })

  describe('Product Filtering', () => {
    beforeEach(() => {
      cy.seedDb()
    })

    it('should filter products by category', () => {
      cy.visit('/')
      cy.filterByCategory('electronics')
      
      cy.wait('@getProducts').its('response.statusCode').should('eq', 200)
      cy.url().should('include', 'category=electronics')
      
      // Verify filtered results
      cy.get('[data-cy=product-card]').should('have.length.greaterThan', 0)
    })

    it('should filter products by price range', () => {
      cy.visit('/')
      cy.get('[data-cy=price-min]').type('100')
      cy.get('[data-cy=price-max]').type('500')
      cy.get('[data-cy=apply-price-filter]').click()
      
      cy.wait('@getProducts').its('response.statusCode').should('eq', 200)
      
      // Verify price range
      cy.get('[data-cy=product-card]').each(($el) => {
        const priceText = cy.wrap($el).find('[data-cy=product-price]').invoke('text')
        priceText.then((text) => {
          const price = parseFloat(text.replace(/[^0-9.]/g, ''))
          expect(price).to.be.gte(100).and.lte(500)
        })
      })
    })

    it('should sort products by price', () => {
      cy.visit('/')
      cy.get('[data-cy=sort-select]').select('price-low-to-high')
      
      cy.wait('@getProducts').its('response.statusCode').should('eq', 200)
      
      // Verify sorting
      let previousPrice = 0
      cy.get('[data-cy=product-card]').each(($el) => {
        cy.wrap($el).find('[data-cy=product-price]').invoke('text').then((text) => {
          const price = parseFloat(text.replace(/[^0-9.]/g, ''))
          expect(price).to.be.gte(previousPrice)
          previousPrice = price
        })
      })
    })
  })

  describe('Product Details', () => {
    beforeEach(() => {
      cy.seedDb()
    })

    it('should view product details', () => {
      cy.visit('/')
      
      // Click on first product
      cy.get('[data-cy=product-card]').first().click()
      cy.measurePageLoad('Product Details')
      
      // Verify product details page
      cy.get('[data-cy=product-detail-name]').should('be.visible')
      cy.get('[data-cy=product-detail-price]').should('be.visible')
      cy.get('[data-cy=product-detail-description]').should('be.visible')
      cy.get('[data-cy=product-detail-image]').should('be.visible')
      cy.get('[data-cy=add-to-cart-detail]').should('be.visible')
    })

    it('should add product to cart from details page', () => {
      cy.visit('/')
      
      cy.get('[data-cy=product-card]').first().click()
      cy.get('[data-cy=add-to-cart-detail]').click()
      
      cy.wait('@addToCart').its('response.statusCode').should('eq', 200)
      cy.get('[data-cy=cart-count]').should('contain', '1')
      cy.get('[data-cy=add-to-cart-success]').should('be.visible')
    })

    it('should handle product not found', () => {
      cy.visit('/products/nonexistent-product-id')
      
      cy.get('[data-cy=product-not-found]').should('be.visible')
      cy.get('[data-cy=error-message]').should('contain', 'Product not found')
    })
  })

  describe('Product Reviews', () => {
    beforeEach(() => {
      cy.login('testuser@example.com', 'password123')
      cy.seedDb()
    })

    it('should display product reviews', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().click()
      
      cy.get('[data-cy=reviews-section]').should('be.visible')
      cy.get('[data-cy=review-item]').should('have.length.greaterThan', 0)
      
      // Check review elements
      cy.get('[data-cy=review-item]').first().within(() => {
        cy.get('[data-cy=review-author]').should('be.visible')
        cy.get('[data-cy=review-rating]').should('be.visible')
        cy.get('[data-cy=review-text]').should('be.visible')
      })
    })

    it('should add a product review', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().click()
      
      const reviewData = {
        rating: 5,
        title: 'Great Product!',
        text: 'This is an excellent product. Highly recommended!'
      }
      
      cy.get('[data-cy=add-review-button]').click()
      cy.get('[data-cy=review-rating]').click() // Click 5 stars
      cy.get('[data-cy=review-title]').type(reviewData.title)
      cy.get('[data-cy=review-text]').type(reviewData.text)
      cy.get('[data-cy=submit-review]').click()
      
      cy.get('[data-cy=review-success]').should('be.visible')
      
      // Verify review appears
      cy.get('[data-cy=reviews-section]').should('contain', reviewData.title)
      cy.get('[data-cy=reviews-section]').should('contain', reviewData.text)
    })

    it('should validate review submission', () => {
      cy.visit('/')
      cy.get('[data-cy=product-card]').first().click()
      
      cy.get('[data-cy=add-review-button]').click()
      cy.get('[data-cy=submit-review]').click()
      
      // Should show validation errors
      cy.get('[data-cy=review-rating-error]').should('be.visible')
      cy.get('[data-cy=review-title-error]').should('be.visible')
      cy.get('[data-cy=review-text-error]').should('be.visible')
    })
  })

  describe('Product Comparison', () => {
    beforeEach(() => {
      cy.seedDb()
    })

    it('should add products to comparison', () => {
      cy.visit('/')
      
      // Add first product to comparison
      cy.get('[data-cy=product-card]').eq(0).within(() => {
        cy.get('[data-cy=compare-product]').click()
      })
      
      // Add second product to comparison
      cy.get('[data-cy=product-card]').eq(1).within(() => {
        cy.get('[data-cy=compare-product]').click()
      })
      
      cy.get('[data-cy=comparison-count]').should('contain', '2')
      
      // View comparison
      cy.get('[data-cy=view-comparison]').click()
      
      cy.get('[data-cy=comparison-table]').should('be.visible')
      cy.get('[data-cy=comparison-row]').should('have.length', 2)
    })

    it('should remove products from comparison', () => {
      cy.visit('/')
      
      // Add products to comparison
      cy.get('[data-cy=product-card]').eq(0).within(() => {
        cy.get('[data-cy=compare-product]').click()
      })
      
      cy.get('[data-cy=view-comparison]').click()
      
      // Remove from comparison
      cy.get('[data-cy=remove-from-comparison]').first().click()
      
      cy.get('[data-cy=comparison-row]').should('have.length', 1)
      cy.get('[data-cy=comparison-count]').should('contain', '1')
    })
  })

  describe('Product Wishlist', () => {
    beforeEach(() => {
      cy.login('testuser@example.com', 'password123')
      cy.seedDb()
    })

    it('should add product to wishlist', () => {
      cy.visit('/')
      
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-wishlist]').click()
      })
      
      cy.get('[data-cy=wishlist-success]').should('be.visible')
      
      // View wishlist
      cy.get('[data-cy=wishlist-button]').click()
      cy.get('[data-cy=wishlist-items]').should('have.length', 1)
    })

    it('should remove product from wishlist', () => {
      cy.visit('/')
      
      // Add to wishlist
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-wishlist]').click()
      })
      
      // View wishlist and remove
      cy.get('[data-cy=wishlist-button]').click()
      cy.get('[data-cy=remove-from-wishlist]').click()
      
      cy.get('[data-cy=wishlist-items]').should('have.length', 0)
      cy.get('[data-cy=empty-wishlist]').should('be.visible')
    })
  })
})
