import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

let redisClient: RedisClientType;

// Redis connection configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Connect to Redis
export async function connectToRedis(): Promise<RedisClientType> {
  try {
    console.log('Attempting to connect to Redis at:', REDIS_URL);
    
    redisClient = createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
      },
      // Retry strategy
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          console.error('Redis server connection refused');
          return new Error('Redis server connection refused');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          return undefined;
        }
        // Retry after 3 seconds
        return Math.min(options.attempt * 100, 3000);
      }
    });

    // Event listeners
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      console.log('Redis Client Ready');
    });

    redisClient.on('end', () => {
      console.log('Redis Client Disconnected');
    });

    await redisClient.connect();
    
    // Test connection
    await redisClient.ping();
    console.log('Redis connected successfully');
    
    return redisClient;
  } catch (error) {
    console.error('Redis connection error:', error);
    // Return null to allow application to continue without Redis
    return null;
  }
}

// Get Redis client instance
export function getRedisClient(): RedisClientType | null {
  try {
    return redisClient || null;
  } catch (error) {
    console.error('Error getting Redis client:', error);
    return null;
  }
}

// Close Redis connection
export async function closeRedisConnection(): Promise<void> {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      console.log('Redis connection closed');
    }
  } catch (error) {
    console.error('Error closing Redis connection:', error);
  }
}

// Redis utility functions
export class RedisCache {
  private client: RedisClientType | null;

  constructor() {
    this.client = getRedisClient();
  }

  // Set cache with TTL (time to live in seconds)
  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    try {
      if (!this.client) return false;
      
      const serializedValue = JSON.stringify(value);
      if (ttl > 0) {
        await this.client.setEx(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  // Get cache value
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.client) return null;
      
      const value = await this.client.get(key);
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  // Delete cache key
  async del(key: string): Promise<boolean> {
    try {
      if (!this.client) return false;
      
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      if (!this.client) return false;
      
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // Set TTL for existing key
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      if (!this.client) return false;
      
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  // Get TTL for key
  async ttl(key: string): Promise<number> {
    try {
      if (!this.client) return -1;
      
      return await this.client.ttl(key);
    } catch (error) {
      console.error('Redis TTL error:', error);
      return -1;
    }
  }

  // Increment counter
  async incr(key: string): Promise<number | null> {
    try {
      if (!this.client) return null;
      
      return await this.client.incr(key);
    } catch (error) {
      console.error('Redis INCR error:', error);
      return null;
    }
  }

  // Increment counter by value
  async incrBy(key: string, value: number): Promise<number | null> {
    try {
      if (!this.client) return null;
      
      return await this.client.incrBy(key, value);
    } catch (error) {
      console.error('Redis INCRBY error:', error);
      return null;
    }
  }

  // Get all keys matching pattern
  async keys(pattern: string): Promise<string[]> {
    try {
      if (!this.client) return [];
      
      return await this.client.keys(pattern);
    } catch (error) {
      console.error('Redis KEYS error:', error);
      return [];
    }
  }

  // Clear all cache (use with caution)
  async flushAll(): Promise<boolean> {
    try {
      if (!this.client) return false;
      
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error('Redis FLUSHALL error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const redisCache = new RedisCache();

// Rate limiting utility
export class RateLimiter {
  private cache: RedisCache;

  constructor() {
    this.cache = redisCache;
  }

  // Check if rate limit is exceeded
  async isExceeded(
    identifier: string, 
    limit: number, 
    window: number
  ): Promise<{ exceeded: boolean; remaining: number; resetTime: number }> {
    const key = `rate_limit:${identifier}`;
    
    try {
      const current = await this.cache.incr(key);
      
      if (current === 1) {
        // Set expiration for first request
        await this.cache.expire(key, window);
      }

      const remaining = Math.max(0, limit - current);
      const resetTime = Date.now() + (window * 1000);

      return {
        exceeded: current > limit,
        remaining,
        resetTime
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Allow request if Redis fails
      return { exceeded: false, remaining: limit, resetTime: Date.now() + (window * 1000) };
    }
  }
}

export const rateLimiter = new RateLimiter();

export default redisClient;
