import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { redisCache, rateLimiter } from '../../server/redis';

describe('Redis Cache Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RedisCache', () => {
    it('should handle set operation when Redis is unavailable', async () => {
      const result = await redisCache.set('test-key', { data: 'test' }, 3600);
      expect(result).toBe(false);
    });

    it('should handle get operation when Redis is unavailable', async () => {
      const result = await redisCache.get('test-key');
      expect(result).toBeNull();
    });

    it('should handle delete operation when Redis is unavailable', async () => {
      const result = await redisCache.del('test-key');
      expect(result).toBe(false);
    });

    it('should handle exists operation when Redis is unavailable', async () => {
      const result = await redisCache.exists('test-key');
      expect(result).toBe(false);
    });

    it('should handle increment operation when Redis is unavailable', async () => {
      const result = await redisCache.incr('counter-key');
      expect(result).toBeNull();
    });

    it('should handle keys operation when Redis is unavailable', async () => {
      const result = await redisCache.keys('pattern*');
      expect(result).toEqual([]);
    });

    it('should handle flushAll operation when Redis is unavailable', async () => {
      const result = await redisCache.flushAll();
      expect(result).toBe(false);
    });
  });

  describe('RateLimiter', () => {
    it('should allow requests when Redis is unavailable', async () => {
      const result = await rateLimiter.isExceeded('test-ip', 100, 60);
      
      expect(result).toHaveProperty('exceeded', false);
      expect(result).toHaveProperty('remaining', 100);
      expect(result).toHaveProperty('resetTime');
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should calculate remaining requests correctly', async () => {
      const result = await rateLimiter.isExceeded('test-ip', 10, 60);
      
      expect(result.remaining).toBe(10);
      expect(result.exceeded).toBe(false);
    });
  });
});
