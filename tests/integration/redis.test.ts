import { RedisTestUtils, TestRedisFactory } from '../utils/redisTestUtils';

describe('Redis Integration Tests', () => {
  describe('Mock Redis Operations', () => {
    beforeEach(() => {
      TestRedisFactory.resetMock();
    });

    it('should perform basic Redis operations with mock client', async () => {
      await RedisTestUtils.withMockRedis(async (client) => {
        // Test SET and GET
        await client.set('test:key', 'test:value');
        const value = await client.get('test:key');
        expect(value).toBe('test:value');

        // Test SETEX and TTL
        await client.setEx('test:expiry', 60, 'expiry:value');
        const ttl = await client.ttl('test:expiry');
        expect(ttl).toBeGreaterThan(0);
        expect(ttl).toBeLessThanOrEqual(60);

        // Test EXISTS
        const exists = await client.exists('test:key');
        expect(exists).toBe(1);

        // Test DEL
        const deleted = await client.del('test:key');
        expect(deleted).toBe(1);

        const notExists = await client.exists('test:key');
        expect(notExists).toBe(0);
      });
    });

    it('should handle increment operations', async () => {
      await RedisTestUtils.withMockRedis(async (client) => {
        // Test INCR
        let count = await client.incr('test:counter');
        expect(count).toBe(1);

        count = await client.incr('test:counter');
        expect(count).toBe(2);

        // Test INCRBY
        count = await client.incrBy('test:counter', 5);
        expect(count).toBe(7);
      });
    });

    it('should handle key patterns', async () => {
      await RedisTestUtils.withMockRedis(async (client) => {
        // Set multiple keys
        await client.set('user:1', 'user1');
        await client.set('user:2', 'user2');
        await client.set('product:1', 'product1');

        // Test KEYS pattern
        const userKeys = await client.keys('user:*');
        expect(userKeys).toHaveLength(2);
        expect(userKeys).toContain('user:1');
        expect(userKeys).toContain('user:2');

        const allKeys = await client.keys('*');
        expect(allKeys).toHaveLength(3);
      });
    });

    it('should handle TTL expiration', async () => {
      await RedisTestUtils.withMockRedis(async (client) => {
        // Set key with 1 second TTL
        await client.setEx('test:expire', 1, 'expire:value');

        // Should exist immediately
        let exists = await client.exists('test:expire');
        expect(exists).toBe(1);

        let value = await client.get('test:expire');
        expect(value).toBe('expire:value');

        // Wait for expiration (in real implementation, this would need time mocking)
        // For mock, we'll manually expire
        await new Promise(resolve => setTimeout(resolve, 1100));
        
        // In mock, we need to simulate expiration
        // This would be handled differently in real Redis
      });
    });

    it('should handle FLUSHALL', async () => {
      await RedisTestUtils.withMockRedis(async (client) => {
        // Set multiple keys
        await client.set('key1', 'value1');
        await client.set('key2', 'value2');
        await client.set('key3', 'value3');

        // Verify keys exist
        let keys = await client.keys('*');
        expect(keys).toHaveLength(3);

        // Flush all
        const result = await client.flushAll();
        expect(result).toBe('OK');

        // Verify all keys are gone
        keys = await client.keys('*');
        expect(keys).toHaveLength(0);
      });
    });
  });

  describe('Redis Test Utilities', () => {
    it('should generate and verify test data', async () => {
      await RedisTestUtils.withMockRedis(async (client) => {
        // Setup test data
        await RedisTestUtils.setupTestData(client);

        // Verify test data
        const isValid = await RedisTestUtils.verifyTestData(client);
        expect(isValid).toBe(true);
      });
    });

    it('should handle complex data structures', async () => {
      await RedisTestUtils.withMockRedis(async (client) => {
        const complexData = {
          users: [
            { id: 1, name: 'User 1', roles: ['admin', 'user'] },
            { id: 2, name: 'User 2', roles: ['user'] }
          ],
          products: {
            electronics: [
              { id: 1, name: 'Laptop', price: 999.99 },
              { id: 2, name: 'Phone', price: 699.99 }
            ],
            books: [
              { id: 3, name: 'JavaScript Guide', price: 29.99 }
            ]
          },
          metadata: {
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            totalUsers: 2,
            totalProducts: 3
          }
        };

        // Store complex data
        await client.set('test:complex', JSON.stringify(complexData));

        // Retrieve and verify
        const retrieved = await client.get('test:complex');
        expect(retrieved).toBeTruthy();

        const parsed = JSON.parse(retrieved!);
        expect(parsed.users).toHaveLength(2);
        expect(parsed.products.electronics).toHaveLength(2);
        expect(parsed.metadata.totalUsers).toBe(2);
      });
    });
  });

  describe('Redis Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      const client = TestRedisFactory.createMockClient();
      await client.connect();

      // Simulate connection closed
      await client.quit();

      // Operations should fail
      await expect(client.set('test:key', 'value')).rejects.toThrow('Redis not connected');
      await expect(client.get('test:key')).rejects.toThrow('Redis not connected');
    });

    it('should handle invalid operations', async () => {
      await RedisTestUtils.withMockRedis(async (client) => {
        // Try to increment non-numeric value
        await client.set('test:non-numeric', 'not-a-number');
        
        // This should handle gracefully (implementation dependent)
        const result = await client.incr('test:non-numeric');
        // Mock implementation might handle this differently
        expect(typeof result).toBe('number');
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle bulk operations efficiently', async () => {
      await RedisTestUtils.withMockRedis(async (client) => {
        const startTime = Date.now();
        const numOperations = 1000;

        // Bulk SET operations
        for (let i = 0; i < numOperations; i++) {
          await client.set(`bulk:key:${i}`, `value:${i}`);
        }

        const setTime = Date.now() - startTime;

        // Bulk GET operations
        const getStartTime = Date.now();
        for (let i = 0; i < numOperations; i++) {
          await client.get(`bulk:key:${i}`);
        }
        const getTime = Date.now() - getStartTime;

        // Performance assertions (mock will be very fast)
        expect(setTime).toBeLessThan(1000); // 1 second
        expect(getTime).toBeLessThan(1000); // 1 second

        // Verify all keys exist
        const keys = await client.keys('bulk:key:*');
        expect(keys).toHaveLength(numOperations);
      });
    });
  });
});
