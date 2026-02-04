import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';

const API_URL = 'http://localhost:5000';

describe('Authentication Integration Tests', () => {
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if server is running
    try {
      await request(API_URL).get('/api/health').expect(200);
      console.log('✅ Server is running');
    } catch (error) {
      console.error('❌ Server is not running. Please start the server with: npm run dev:server');
      throw error;
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
      const response = await request(API_URL)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Check if response has user data directly or wrapped
      if (response.body.user) {
        expect(response.body.user).toHaveProperty('_id');
        expect(response.body.user).toHaveProperty('email', testUser.email);
        expect(response.body.user).toHaveProperty('name', testUser.name);
        expect(response.body.user).not.toHaveProperty('password');
        expect(response.body).toHaveProperty('token');
        authToken = response.body.token;
      } else {
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('email', testUser.email);
        expect(response.body).toHaveProperty('name', testUser.name);
        expect(response.body).not.toHaveProperty('password');
        if (response.body.token) {
          authToken = response.body.token;
        }
      }
    });

    it('should handle registration with valid data', async () => {
      const response = await request(API_URL)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Just check it returns 201 and has some user data
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('name', testUser.name);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await request(API_URL)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(API_URL)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      // Check response structure
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('name', 'Test User');
      if (response.body.token) {
        expect(typeof response.body.token).toBe('string');
        authToken = response.body.token;
      }
    });

    it('should return error for invalid credentials', async () => {
      const response = await request(API_URL)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid');
    });

    it('should return error for non-existent user', async () => {
      const response = await request(API_URL)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('API Health Check', () => {
    it('should return health status', async () => {
      const response = await request(API_URL)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Basic API Connectivity', () => {
    it('should handle basic requests', async () => {
      // Test that the server responds to basic requests
      const response = await request(API_URL)
        .get('/api/health')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });
});
