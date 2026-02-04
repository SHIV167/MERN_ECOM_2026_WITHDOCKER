describe('User Authentication Flow', () => {
  beforeEach(() => {
    cy.interceptApiCalls()
  })

  describe('User Registration', () => {
    it('should register a new user successfully', () => {
      const userData = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      }

      cy.visit('/register')
      cy.measurePageLoad('Registration')
      
      // Fill registration form
      cy.get('[data-cy=name]').type(userData.name)
      cy.get('[data-cy=email]').type(userData.email)
      cy.get('[data-cy=password]').type(userData.password)
      cy.get('[data-cy=confirm-password]').type(userData.confirmPassword)
      
      // Submit form
      cy.get('[data-cy=register-button]').click()
      
      // Wait for API call and verify success
      cy.wait('@register').its('response.statusCode').should('eq', 201)
      
      // Should redirect to dashboard or home
      cy.url().should('not.include', '/register')
      cy.get('[data-cy=user-menu]').should('be.visible')
      cy.get('[data-cy=user-name]').should('contain', userData.name)
    })

    it('should show validation errors for invalid data', () => {
      const validationRules = {
        name: { required: true, minLength: 2 },
        email: { required: true, email: true },
        password: { required: true, minLength: 6 },
        'confirm-password': { required: true }
      }

      cy.visit('/register')
      cy.testFormValidation('[data-cy=registration-form]', validationRules)
    })

    it('should show error for duplicate email', () => {
      // First register a user
      cy.register({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123'
      })

      // Try to register with same email
      cy.visit('/register')
      cy.get('[data-cy=name]').type('New User')
      cy.get('[data-cy=email]').type('existing@example.com')
      cy.get('[data-cy=password]').type('password123')
      cy.get('[data-cy=confirm-password]').type('password123')
      cy.get('[data-cy=register-button]').click()

      cy.wait('@register').its('response.statusCode').should('eq', 400)
      cy.get('[data-cy=error-message]').should('contain', 'already exists')
    })
  })

  describe('User Login', () => {
    beforeEach(() => {
      // Create a test user
      cy.register({
        name: 'Login Test User',
        email: 'logintest@example.com',
        password: 'password123'
      })
    })

    it('should login successfully with valid credentials', () => {
      cy.visit('/login')
      cy.measurePageLoad('Login')
      
      cy.get('[data-cy=email]').type('logintest@example.com')
      cy.get('[data-cy=password]').type('password123')
      cy.get('[data-cy=login-button]').click()

      cy.wait('@login').its('response.statusCode').should('eq', 200)
      cy.url().should('not.include', '/login')
      cy.get('[data-cy=user-menu]').should('be.visible')
    })

    it('should show error for invalid credentials', () => {
      cy.visit('/login')
      cy.get('[data-cy=email]').type('logintest@example.com')
      cy.get('[data-cy=password]').type('wrongpassword')
      cy.get('[data-cy=login-button]').click()

      cy.wait('@login').its('response.statusCode').should('eq', 401)
      cy.get('[data-cy=error-message]').should('contain', 'Invalid credentials')
      cy.url().should('include', '/login')
    })

    it('should show validation errors for empty fields', () => {
      const validationRules = {
        email: { required: true, email: true },
        password: { required: true }
      }

      cy.visit('/login')
      cy.testFormValidation('[data-cy=login-form]', validationRules)
    })
  })

  describe('User Logout', () => {
    beforeEach(() => {
      cy.login('logintest@example.com', 'password123')
    })

    it('should logout successfully', () => {
      cy.get('[data-cy=user-menu]').click()
      cy.get('[data-cy=logout-button]').click()
      
      // Should redirect to home and show login button
      cy.url().should('not.include', '/dashboard')
      cy.get('[data-cy=login-button]').should('be.visible')
      cy.get('[data-cy=user-menu]').should('not.exist')
    })
  })

  describe('Password Reset', () => {
    it('should send password reset email', () => {
      cy.visit('/forgot-password')
      
      cy.get('[data-cy=email]').type('logintest@example.com')
      cy.get('[data-cy=reset-button]').click()
      
      cy.get('[data-cy=success-message]').should('contain', 'reset link sent')
    })
  })

  describe('Profile Management', () => {
    beforeEach(() => {
      cy.login('logintest@example.com', 'password123')
    })

    it('should update user profile', () => {
      cy.visit('/profile')
      cy.measurePageLoad('Profile')
      
      const updatedData = {
        name: 'Updated Name',
        phone: '+1234567890'
      }

      cy.get('[data-cy=profile-name]').clear().type(updatedData.name)
      cy.get('[data-cy=profile-phone]').clear().type(updatedData.phone)
      cy.get('[data-cy=update-profile-button]').click()

      cy.get('[data-cy=success-message]').should('contain', 'updated successfully')
      cy.get('[data-cy=profile-name]').should('have.value', updatedData.name)
    })

    it('should change password', () => {
      cy.visit('/profile/change-password')
      
      cy.get('[data-cy=current-password]').type('password123')
      cy.get('[data-cy=new-password]').type('newpassword123')
      cy.get('[data-cy=confirm-new-password]').type('newpassword123')
      cy.get('[data-cy=change-password-button]').click()

      cy.get('[data-cy=success-message]').should('contain', 'password changed')
      
      // Test login with new password
      cy.get('[data-cy=user-menu]').click()
      cy.get('[data-cy=logout-button]').click()
      
      cy.visit('/login')
      cy.get('[data-cy=email]').type('logintest@example.com')
      cy.get('[data-cy=password]').type('newpassword123')
      cy.get('[data-cy=login-button]').click()

      cy.url().should('not.include', '/login')
    })
  })
})
