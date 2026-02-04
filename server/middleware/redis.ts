import { Request, Response, NextFunction } from 'express';
import { rateLimiter, redisCache } from '../redis';

// Rate limiting middleware
export const rateLimitMiddleware = (limit: number = 100, window: number = 60) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use IP address as identifier, or user ID if authenticated
      const identifier = req.ip || req.connection.remoteAddress || 'unknown';
      
      const result = await rateLimiter.isExceeded(identifier, limit, window);
      
      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
      });

      if (result.exceeded) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiting middleware error:', error);
      // Allow request if rate limiting fails
      next();
    }
  };
};

// Cache middleware
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const cacheKey = `cache:${req.originalUrl || req.url}`;
      const cachedResponse = await redisCache.get(cacheKey);

      if (cachedResponse) {
        // Set cache headers
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-TTL', await redisCache.ttl(cacheKey).toString());
        return res.json(cachedResponse);
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data: any) {
        // Cache the response
        redisCache.set(cacheKey, data, ttl).catch(err => {
          console.error('Cache set error:', err);
        });

        // Set cache headers
        res.set('X-Cache', 'MISS');
        res.set('X-Cache-TTL', ttl.toString());

        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Invalidate cache middleware
export const invalidateCacheMiddleware = (patterns: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original end function
    const originalEnd = res.end;
    
    res.end = function(...args: any[]) {
      // Invalidate cache patterns after response is sent
      setImmediate(async () => {
        try {
          for (const pattern of patterns) {
            const keys = await redisCache.keys(pattern);
            for (const key of keys) {
              await redisCache.del(key);
            }
          }
        } catch (error) {
          console.error('Cache invalidation error:', error);
        }
      });

      return originalEnd.apply(this, args);
    };

    next();
  };
};

// Session middleware using Redis
export const sessionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.cookies?.sessionId || `session_${Date.now()}_${Math.random()}`;
    
    // Get session data from Redis
    let sessionData = await redisCache.get(`session:${sessionId}`);
    
    if (!sessionData) {
      sessionData = {
        id: sessionId,
        created: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        data: {}
      };
    } else {
      sessionData.lastAccessed = new Date().toISOString();
    }

    // Update session in Redis with 24-hour TTL
    await redisCache.set(`session:${sessionId}`, sessionData, 86400);

    // Set session cookie if not present
    if (!req.cookies?.sessionId) {
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 86400000, // 24 hours
        sameSite: 'strict'
      });
    }

    // Attach session to request
    req.session = sessionData;

    next();
  } catch (error) {
    console.error('Session middleware error:', error);
    // Continue without session if Redis fails
    req.session = {
      id: 'fallback',
      created: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      data: {}
    };
    next();
  }
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      session?: {
        id: string;
        created: string;
        lastAccessed: string;
        data: Record<string, any>;
      };
    }
  }
}
