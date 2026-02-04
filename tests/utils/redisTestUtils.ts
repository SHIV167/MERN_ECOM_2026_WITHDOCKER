import { RedisClientType, createClient } from 'redis';

// Mock Redis client for testing
export class MockRedisClient {
  private data: Map<string, any> = new Map();
  private ttl: Map<string, number> = new Map();
  private isOpen: boolean = true;

  async connect(): Promise<void> {
    this.isOpen = true;
  }

  async quit(): Promise<void> {
    this.isOpen = false;
  }

  async ping(): Promise<string> {
    return 'PONG';
  }

  async set(key: string, value: string): Promise<string | null> {
    if (!this.isOpen) throw new Error('Redis not connected');
    this.data.set(key, value);
    return 'OK';
  }

  async setEx(key: string, seconds: number, value: string): Promise<string | null> {
    if (!this.isOpen) throw new Error('Redis not connected');
    this.data.set(key, value);
    this.ttl.set(key, Date.now() + (seconds * 1000));
    return 'OK';
  }

  async get(key: string): Promise<string | null> {
    if (!this.isOpen) throw new Error('Redis not connected');
    
    // Check TTL
    const expiry = this.ttl.get(key);
    if (expiry && Date.now() > expiry) {
      this.data.delete(key);
      this.ttl.delete(key);
      return null;
    }
    
    return this.data.get(key) || null;
  }

  async del(key: string): Promise<number> {
    if (!this.isOpen) throw new Error('Redis not connected');
    const deleted = this.data.has(key) ? 1 : 0;
    this.data.delete(key);
    this.ttl.delete(key);
    return deleted;
  }

  async exists(key: string): Promise<number> {
    if (!this.isOpen) throw new Error('Redis not connected');
    
    // Check TTL
    const expiry = this.ttl.get(key);
    if (expiry && Date.now() > expiry) {
      this.data.delete(key);
      this.ttl.delete(key);
      return 0;
    }
    
    return this.data.has(key) ? 1 : 0;
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (!this.isOpen) throw new Error('Redis not connected');
    
    if (this.data.has(key)) {
      this.ttl.set(key, Date.now() + (seconds * 1000));
      return 1;
    }
    return 0;
  }

  async ttl(key: string): Promise<number> {
    if (!this.isOpen) throw new Error('Redis not connected');
    
    const expiry = this.ttl.get(key);
    if (!expiry) return -1;
    
    const remaining = Math.floor((expiry - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  async incr(key: string): Promise<number> {
    if (!this.isOpen) throw new Error('Redis not connected');
    
    const current = parseInt(this.data.get(key) || '0', 10);
    const newValue = current + 1;
    this.data.set(key, newValue.toString());
    return newValue;
  }

  async incrBy(key: string, increment: number): Promise<number> {
    if (!this.isOpen) throw new Error('Redis not connected');
    
    const current = parseInt(this.data.get(key) || '0', 10);
    const newValue = current + increment;
    this.data.set(key, newValue.toString());
    return newValue;
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.isOpen) throw new Error('Redis not connected');
    
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.data.keys()).filter(key => regex.test(key));
  }

  async flushAll(): Promise<string> {
    if (!this.isOpen) throw new Error('Redis not connected');
    
    this.data.clear();
    this.ttl.clear();
    return 'OK';
  }

  // Mock event emitter methods
  on(event: string, listener: Function): void {
    // Mock implementation
  }

  off(event: string, listener: Function): void {
    // Mock implementation
  }

  get isOpen(): boolean {
    return this.isOpen;
  }
}

// Test Redis factory
export class TestRedisFactory {
  private static mockClient: MockRedisClient | null = null;

  static createMockClient(): MockRedisClient {
    if (!this.mockClient) {
      this.mockClient = new MockRedisClient();
    }
    return this.mockClient;
  }

  static createRealClient(url: string): RedisClientType {
    return createClient({ url });
  }

  static resetMock(): void {
    if (this.mockClient) {
      this.mockClient.flushAll();
    }
  }

  static closeMock(): void {
    if (this.mockClient) {
      this.mockClient.quit();
      this.mockClient = null;
    }
  }
}

// Redis test utilities
export class RedisTestUtils {
  static async withMockRedis<T>(testFn: (client: MockRedisClient) => Promise<T>): Promise<T> {
    const client = TestRedisFactory.createMockClient();
    try {
      await client.connect();
      const result = await testFn(client);
      return result;
    } finally {
      await client.quit();
      TestRedisFactory.resetMock();
    }
  }

  static async withRealRedis<T>(url: string, testFn: (client: RedisClientType) => Promise<T>): Promise<T> {
    const client = TestRedisFactory.createRealClient(url);
    try {
      await client.connect();
      const result = await testFn(client);
      return result;
    } finally {
      await client.quit();
    }
  }

  static generateTestData(): Record<string, any> {
    return {
      user: {
        id: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date().toISOString()
      },
      product: {
        id: 'test-product-456',
        name: 'Test Product',
        price: 99.99,
        category: 'electronics',
        inStock: true
      },
      session: {
        id: 'test-session-789',
        userId: 'test-user-123',
        cart: [],
        lastActivity: new Date().toISOString()
      }
    };
  }

  static async setupTestData(client: MockRedisClient | RedisClientType): Promise<void> {
    const data = this.generateTestData();
    
    // Set test data with different TTLs
    await client.set('test:user:123', JSON.stringify(data.user));
    await client.setEx('test:product:456', 3600, JSON.stringify(data.product));
    await client.setEx('test:session:789', 1800, JSON.stringify(data.session));
    
    // Set some counters
    await client.set('test:counter:views', '0');
    await client.set('test:counter:orders', '0');
  }

  static async verifyTestData(client: MockRedisClient | RedisClientType): Promise<boolean> {
    const data = this.generateTestData();
    
    // Check user data
    const userStr = await client.get('test:user:123');
    if (!userStr) return false;
    const user = JSON.parse(userStr);
    if (user.id !== data.user.id) return false;
    
    // Check product data
    const productStr = await client.get('test:product:456');
    if (!productStr) return false;
    const product = JSON.parse(productStr);
    if (product.id !== data.product.id) return false;
    
    // Check session data
    const sessionStr = await client.get('test:session:789');
    if (!sessionStr) return false;
    const session = JSON.parse(sessionStr);
    if (session.id !== data.session.id) return false;
    
    return true;
  }
}

// Jest mock for Redis
export const createJestRedisMock = () => ({
  createClient: jest.fn().mockImplementation((options: any) => {
    if (process.env.USE_MOCK_REDIS === 'true') {
      return TestRedisFactory.createMockClient();
    }
    return createClient(options);
  }),
  MockRedisClient,
  TestRedisFactory,
  RedisTestUtils
});
