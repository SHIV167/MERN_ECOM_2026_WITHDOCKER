import { redisCache } from '../redis';

// Cache service for frequently accessed data
export class CacheService {
  // Cache products by category
  static async cacheProductsByCategory(categoryId: string, products: any[], ttl: number = 1800) {
    const key = `products:category:${categoryId}`;
    return await redisCache.set(key, products, ttl);
  }

  static async getCachedProductsByCategory(categoryId: string) {
    const key = `products:category:${categoryId}`;
    return await redisCache.get(key);
  }

  // Cache featured products
  static async cacheFeaturedProducts(products: any[], ttl: number = 3600) {
    const key = 'products:featured';
    return await redisCache.set(key, products, ttl);
  }

  static async getCachedFeaturedProducts() {
    const key = 'products:featured';
    return await redisCache.get(key);
  }

  // Cache user sessions
  static async cacheUserSession(userId: string, sessionData: any, ttl: number = 86400) {
    const key = `user:session:${userId}`;
    return await redisCache.set(key, sessionData, ttl);
  }

  static async getCachedUserSession(userId: string) {
    const key = `user:session:${userId}`;
    return await redisCache.get(key);
  }

  // Invalidate user cache
  static async invalidateUserCache(userId: string) {
    const patterns = [
      `user:session:${userId}`,
      `user:cart:${userId}`,
      `user:wishlist:${userId}`
    ];
    
    for (const pattern of patterns) {
      await redisCache.del(pattern);
    }
  }
}

export default CacheService;
