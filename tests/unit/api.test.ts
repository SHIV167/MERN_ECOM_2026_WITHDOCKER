import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeAll } from '@jest/globals';
import { connectToDatabase } from '../../server/db';
import { registerRoutes } from '../../server/routes';

describe('API Health Tests', () => {
  let app: express.Application;

  beforeAll(async () => {
    app = express();
    await connectToDatabase();
    registerRoutes(app);
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('time');
      expect(response.body).toHaveProperty('database', 'connected');
      expect(response.body).toHaveProperty('redis');
    });

    it('should return correct content-type', async () => {
      await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/);
    });
  });

  describe('GET /api/test/auth', () => {
    it('should return 401 when no token provided', async () => {
      const response = await request(app)
        .get('/api/test/auth')
        .expect(401);

      expect(response.body).toHaveProperty('authenticated', false);
      expect(response.body).toHaveProperty('message');
    });
  });
});
