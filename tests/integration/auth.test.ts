import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import app from '../../server/index.js';

describe('Authentication Integration Tests', () => {
  let server: any;
  let authToken: string;
  let userId: string;
  let testUser: any;

  beforeAll(async () => {
    // Start the server
    server = app.listen(0);
    
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Close the server
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(resolve);
      });
    }
  });

  beforeEach(() => {
    // Reset test data
    testUser = {
      name: 'Test User',
      email: `testuser${Date.now()}@example.com`,
      password: 'password123'
    };
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('_id');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('name', testUser.name);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('token');
      
      // Store for later tests
      authToken = response.body.token;
      userId = response.body.user._id;
    });

    it('should return validation error for missing fields', async () => {
      const invalidUser = { email: testUser.email };
      
      const response = await request(server)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should return error for duplicate email', async () => {
      // First registration
      await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Second registration with same email
      const response = await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    it('should return error for invalid email format', async () => {
      const invalidUser = {
        ...testUser,
        email: 'invalid-email'
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('valid email');
    });

    it('should return error for weak password', async () => {
      const invalidUser = {
        ...testUser,
        password: '123'
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('at least 6 characters');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      const response = await request(server)
        .post('/api/auth/register')
        .send(testUser);
      
      authToken = response.body.token;
      userId = response.body.user._id;
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('_id', userId);
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toBeTypeOf('string');
      expect(response.body.token.length).toBeGreaterThan(0);
    });

    it('should return error for invalid credentials', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should return error for non-existent user', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should return error for missing fields', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: testUser.email
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });
  });

  describe('GET /api/auth/me', () => {
    beforeEach(async () => {
      // Register and login a user
      const response = await request(server)
        .post('/api/auth/register')
        .send(testUser);
      
      authToken = response.body.token;
      userId = response.body.user._id;
    });

    it('should get current user with valid token', async () => {
      const response = await request(server)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('_id', userId);
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('name', testUser.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return error without token', async () => {
      const response = await request(server)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return error with invalid token', async () => {
      const response = await request(server)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return error with malformed token', async () => {
      const response = await request(server)
        .get('/api/auth/me')
        .set('Authorization', 'invalid-format')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });
  });

  describe('PUT /api/auth/profile', () => {
    beforeEach(async () => {
      // Register and login a user
      const response = await request(server)
        .post('/api/auth/register')
        .send(testUser);
      
      authToken = response.body.token;
      userId = response.body.user._id;
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        phone: '+1234567890'
      };

      const response = await request(server)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('name', updateData.name);
      expect(response.body.user).toHaveProperty('phone', updateData.phone);
      expect(response.body.user).toHaveProperty('email', testUser.email);
    });

    it('should return error without authentication', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const response = await request(server)
        .put('/api/auth/profile')
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should not allow updating email', async () => {
      const updateData = {
        email: 'newemail@example.com'
      };

      const response = await request(server)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('cannot update email');
    });

    it('should return error for invalid phone format', async () => {
      const updateData = {
        phone: 'invalid-phone'
      };

      const response = await request(server)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('valid phone');
    });
  });

  describe('POST /api/auth/change-password', () => {
    beforeEach(async () => {
      // Register and login a user
      const response = await request(server)
        .post('/api/auth/register')
        .send(testUser);
      
      authToken = response.body.token;
      userId = response.body.user._id;
    });

    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: testUser.password,
        newPassword: 'newpassword123'
      };

      const response = await request(server)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Password changed successfully');

      // Test login with new password
      const loginResponse = await request(server)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: passwordData.newPassword
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
    });

    it('should return error for incorrect current password', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      const response = await request(server)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Current password is incorrect');
    });

    it('should return error for weak new password', async () => {
      const passwordData = {
        currentPassword: testUser.password,
        newPassword: '123'
      };

      const response = await request(server)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('at least 6 characters');
    });

    it('should return error without authentication', async () => {
      const passwordData = {
        currentPassword: testUser.password,
        newPassword: 'newpassword123'
      };

      const response = await request(server)
        .post('/api/auth/change-password')
        .send(passwordData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit login attempts', async () => {
      const loginData = {
        email: testUser.email,
        password: 'wrongpassword'
      };

      // Make multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await request(server)
          .post('/api/auth/login')
          .send(loginData)
          .expect(401);
      }

      // Should be rate limited
      const response = await request(server)
        .post('/api/auth/login')
        .send(loginData)
        .expect(429);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Too many requests');
    });

    it('should rate limit registration attempts', async () => {
      // Make multiple registration attempts
      for (let i = 0; i < 5; i++) {
        await request(server)
          .post('/api/auth/register')
          .send({
            ...testUser,
            email: `user${i}@example.com`
          })
          .expect(201);
      }

      // Should be rate limited
      const response = await request(server)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'ratelimit@example.com'
        })
        .expect(429);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Too many requests');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(server)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });

    it('should not expose sensitive information in error messages', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.error).not.toContain('database');
      expect(response.body.error).not.toContain('sql');
      expect(response.body.error).not.toContain('internal');
    });
  });
});
