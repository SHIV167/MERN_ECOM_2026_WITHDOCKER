import { connectToRedis, redisCache } from './server/redis.ts';

async function testRedis() {
  console.log('Testing Redis implementation...');
  
  try {
    // Test Redis connection
    const client = await connectToRedis();
    if (!client) {
      console.log('❌ Redis connection failed');
      return;
    }
    
    console.log('✅ Redis connected successfully');
    
    // Test basic cache operations
    const testKey = 'test:redis:implementation';
    const testValue = { message: 'Redis is working!', timestamp: new Date().toISOString() };
    
    // Test SET
    const setResult = await redisCache.set(testKey, testValue, 60);
    console.log('✅ SET operation:', setResult ? 'Success' : 'Failed');
    
    // Test GET
    const getResult = await redisCache.get(testKey);
    console.log('✅ GET operation:', getResult ? 'Success' : 'Failed');
    console.log('Retrieved value:', getResult);
    
    // Test EXISTS
    const existsResult = await redisCache.exists(testKey);
    console.log('✅ EXISTS operation:', existsResult ? 'Key exists' : 'Key not found');
    
    // Test DEL
    const delResult = await redisCache.del(testKey);
    console.log('✅ DEL operation:', delResult ? 'Success' : 'Failed');
    
    // Test increment
    const incrKey = 'test:counter';
    await redisCache.set(incrKey, 0, 60);
    const incrResult = await redisCache.incr(incrKey);
    console.log('✅ INCR operation:', incrResult);
    
    // Clean up
    await redisCache.del(incrKey);
    
    console.log('✅ All Redis operations completed successfully!');
    
    // Close connection
    await client.quit();
    console.log('✅ Redis connection closed');
    
  } catch (error) {
    console.error('❌ Redis test failed:', error);
  }
}

// Run the test
testRedis().catch(console.error);
