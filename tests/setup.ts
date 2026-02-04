import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Cleanup
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Mock Redis for testing
jest.mock('../server/redis', () => ({
  connectToRedis: jest.fn().mockResolvedValue(null),
  getRedisClient: jest.fn().mockReturnValue(null),
  redisCache: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(false),
    del: jest.fn().mockResolvedValue(false),
    exists: jest.fn().mockResolvedValue(false),
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(true),
    ttl: jest.fn().mockResolvedValue(-1),
    keys: jest.fn().mockResolvedValue([]),
    flushAll: jest.fn().mockResolvedValue(true)
  },
  rateLimiter: {
    isExceeded: jest.fn().mockResolvedValue({
      exceeded: false,
      remaining: 100,
      resetTime: Date.now() + 60000
    })
  }
}));

// Mock Cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: 'https://example.com/image.jpg',
        public_id: 'test_image'
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' })
    }
  }
}));

// Mock email service
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

// Global test utilities
(global as any).createTestUser = async (userData = {}) => {
  const UserModel = (await import('../server/models/User')).default;
  return await UserModel.create({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    ...userData
  });
};

(global as any).createTestCategory = async (categoryData = {}) => {
  const CategoryModel = (await import('../server/models/Category')).default;
  return await CategoryModel.create({
    name: 'Test Category',
    slug: 'test-category',
    ...categoryData
  });
};

(global as any).createTestProduct = async (productData = {}) => {
  const ProductModel = (await import('../server/models/Product')).default;
  return await ProductModel.create({
    name: 'Test Product',
    slug: 'test-product',
    price: 99.99,
    description: 'Test description',
    category: 'test-category-id',
    ...productData
  });
};
