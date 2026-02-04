import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CacheService } from '../../server/services/cacheService';

describe('CacheService Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Product Caching', () => {
    it('should handle cacheProductsByCategory when Redis is unavailable', async () => {
      const result = await CacheService.cacheProductsByCategory('electronics', [
        { id: 1, name: 'Laptop' }
      ]);
      
      expect(result).toBe(false);
    });

    it('should handle getCachedProductsByCategory when Redis is unavailable', async () => {
      const result = await CacheService.getCachedProductsByCategory('electronics');
      expect(result).toBeNull();
    });

    it('should handle cacheFeaturedProducts when Redis is unavailable', async () => {
      const result = await CacheService.cacheFeaturedProducts([
        { id: 1, name: 'Featured Product' }
      ]);
      
      expect(result).toBe(false);
    });

    it('should handle getCachedFeaturedProducts when Redis is unavailable', async () => {
      const result = await CacheService.getCachedFeaturedProducts();
      expect(result).toBeNull();
    });
  });

  describe('User Session Caching', () => {
    it('should handle cacheUserSession when Redis is unavailable', async () => {
      const sessionData = { userId: '123', email: 'test@example.com' };
      const result = await CacheService.cacheUserSession('123', sessionData);
      
      expect(result).toBe(false);
    });

    it('should handle getCachedUserSession when Redis is unavailable', async () => {
      const result = await CacheService.getCachedUserSession('123');
      expect(result).toBeNull();
    });

    it('should handle invalidateUserCache when Redis is unavailable', async () => {
      const result = await CacheService.invalidateUserCache('123');
      expect(result).toBeUndefined(); // No error thrown
    });
  });
});
