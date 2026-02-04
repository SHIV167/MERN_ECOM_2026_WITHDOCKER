# 🔧 Integration Testing with Supertest - Complete Guide

## 📋 Overview

Supertest is a powerful HTTP assertion library that allows you to test your Node.js HTTP servers and APIs. It provides a high-level abstraction for testing HTTP requests and responses, making it perfect for integration testing your MERN ecommerce application.

## 🚀 Quick Setup

### 1. Install Supertest
```bash
# Install Supertest and related dependencies
npm install --save-dev supertest
npm install --save-dev @types/supertest
npm install --save-dev jest-environment-node
```

### 2. Update Package Scripts

I've already updated your package.json to include Supertest integration testing scripts:

```json
{
  "scripts": {
    "test:integration": "jest --config jest.config.cjs tests/integration",
    "test:integration:watch": "jest --config jest.config.cjs tests/integration --watch",
    "test:integration:coverage": "jest --config jest.config.cjs tests/integration --coverage",
    "test:integration:auth": "jest --config jest.config.cjs tests/integration/auth.test.ts",
    "test:integration:products": "jest --config jest.config.cjs tests/integration/products.test.ts",
    "test:integration:cart": "jest --config jest.config.cjs tests/integration/cart.test.ts",
    "test:integration:orders": "jest --config jest.config.cjs tests/integration/orders.test.ts",
    "test:integration:users": "jest --config jest.config.cjs tests/integration/users.test.ts",
    "test:integration:admin": "jest --config jest.config.cjs tests/integration/admin.test.ts"
  }
}
```

## 📁 Project Structure

```
tests/integration/
├── auth.test.ts               # Authentication flow tests
├── products.test.ts           # Product management tests
├── cart.test.ts                # Shopping cart tests
├── orders.test.ts              # Order processing tests
├── users.test.ts               # User management tests
├── admin.test.ts               # Admin functionality tests
├── run-integration-tests.sh    # Linux/Mac automation script
└── run-integration-tests.bat   # Windows automation script
```

## 🧪 Test Suites Overview

### 1. Authentication Tests (auth.test.ts)
- **User Registration** - Complete registration with validation
- **User Login** - Login with valid/invalid credentials
- **User Profile** - Get current user, update profile
- **Password Management** - Change password, forgot password
- **Token Validation** - JWT token authentication
- **Rate Limiting** - Login attempt limits
- **Security Headers** - Security header validation

### 2. Product Tests (products.test.ts)
- **Category Management** - Create, read categories
- **Product CRUD** - Create, read, update, delete products
- **Product Search** - Search by name, filter by category
- **Product Filtering** - Price range, sorting, pagination
- **Product Reviews** - Add and retrieve product reviews
- **Data Validation** - Input validation and error handling
- **Performance** - Large dataset handling

### 3. Cart Tests (cart.test.ts)
- **Cart Operations** - Add, update, remove items
- **Cart Calculations** - Subtotal, total, tax calculations
- **Cart Persistence** - Maintain cart across sessions
- **Cart Validation** - Stock validation, quantity limits
- **Error Handling** - Invalid operations, edge cases
- **Multi-user Carts** - Separate carts per user

### 4. Order Tests (orders.test.ts)
- **Order Creation** - Complete order creation process
- **Order Management** - Get, update, cancel orders
- **Order Status** - Status transitions and validation
- **Order Filtering** - Filter by status, date sorting
- **Order Security** - User authorization, access control
- **Performance** - Multiple order handling

## 🚀 Quick Start Commands

### Basic Integration Testing
```bash
# Run all integration tests
npm run test:integration

# Run tests in watch mode
npm run test:integration:watch

# Run tests with coverage
npm run test:integration:coverage
```

### Specific Test Suites
```bash
# Run authentication tests
npm run test:integration:auth

# Run product tests
npm run test:integration:products

# Run cart tests
npm run test:integration:cart

# Run order tests
npm run test:integration:orders
```

### Automated Testing
```bash
# Linux/Mac - Run all integration tests with reports
chmod +x tests/integration/run-integration-tests.sh
./tests/integration/run-integration-tests.sh

# Windows - Run all integration tests with reports
tests\integration\run-integration-tests.bat

# Run specific test suites
./tests/integration/run-integration-tests.sh auth
./tests/integration/run-integration-tests.sh products
./tests/integration/run-integration-tests.sh cart
./tests/integration/run-integration-tests.sh orders
```

## 🔧 Test Configuration

### Supertest Setup
```typescript
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import app from '../../server/index.js';

describe('Integration Tests', () => {
  let server: any;
  let authToken: string;

  beforeAll(async () => {
    // Start the server
    server = app.listen(0);
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Close the server
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(resolve);
      });
    }
  });

  it('should make HTTP requests', async () => {
    const response = await request(server)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status');
  });
});
```

### Test Data Management
```typescript
beforeEach(async () => {
  // Reset test data
  testUser = {
    name: 'Test User',
    email: `testuser${Date.now()}@example.com`,
    password: 'password123'
  };

  // Register and login a user
  const userResponse = await request(server)
    .post('/api/auth/register')
    .send(testUser);
  
  authToken = userResponse.body.token;
  userId = userResponse.body.user._id;
});
```

### HTTP Assertions
```typescript
// Status code assertions
await request(server)
  .post('/api/products')
  .send(productData)
  .expect(201);

// Response body assertions
const response = await request(server)
  .get('/api/products')
  .expect(200);

expect(response.body).toBeInstanceOf(Array);
expect(response.body[0]).toHaveProperty('name');
expect(response.body[0]).toHaveProperty('price');

// Header assertions
await request(server)
  .post('/api/auth/login')
  .send(loginData)
  .expect('Content-Type', /json/)
  .expect(200);
```

## 📊 Test Scenarios

### Authentication Flow
```typescript
describe('User Authentication', () => {
  it('should register and login user', async () => {
    // Register user
    const registerResponse = await request(server)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(201);

    expect(registerResponse.body).toHaveProperty('token');

    // Login user
    const loginResponse = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200);

    expect(loginResponse.body).toHaveProperty('token');
    expect(loginResponse.body.user).toHaveProperty('email', 'test@example.com');
  });
});
```

### Product Management
```typescript
describe('Product CRUD', () => {
  let productId: string;

  it('should create a product', async () => {
    const response = await request(server)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Product',
        price: 99.99,
        category: categoryId,
        stock: 100
      })
      .expect(201);

    productId = response.body.product._id;
    expect(response.body.product).toHaveProperty('name', 'Test Product');
  });

  it('should get the product', async () => {
    const response = await request(server)
      .get(`/api/products/${productId}`)
      .expect(200);

    expect(response.body.product).toHaveProperty('_id', productId);
    expect(response.body.product).toHaveProperty('name', 'Test Product');
  });
});
```

### Cart Operations
```typescript
describe('Shopping Cart', () => {
  it('should add item to cart', async () => {
    const response = await request(server)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        productId: productId,
        quantity: 2
      })
      .expect(200);

    expect(response.body.cart.items).toHaveLength(1);
    expect(response.body.cart.items[0]).toHaveProperty('quantity', 2);
  });

  it('should calculate cart total', async () => {
    const response = await request(server)
      .get('/api/cart')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.cart).toHaveProperty('total');
    expect(response.body.cart.total).toBeGreaterThan(0);
  });
});
```

## 🎯 Best Practices

### ✅ Do's
1. **Use unique test data** - Generate unique emails/names for each test
2. **Clean up test data** - Use beforeEach/afterEach to reset state
3. **Test both success and failure cases** - Cover all scenarios
4. **Use proper HTTP status codes** - 200, 201, 400, 401, 404, 500
5. **Validate response structure** - Check required fields and types
6. **Test authentication** - Verify protected routes
7. **Test data validation** - Check input validation and sanitization

### ❌ Don'ts
1. **Don't use static test data** - Avoid conflicts between tests
2. **Don't ignore error cases** - Test all failure scenarios
3. **Don't skip authentication tests** - Always test auth middleware
4. **Don't assume database state** - Set up test data explicitly
5. **Don't use real external services** - Mock external dependencies
6. **Don't forget cleanup** - Clean up test data after tests
7. **Don't test implementation details** - Focus on API contracts

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
- name: Run Integration Tests
  run: |
    npm run dev:server &
    sleep 10
    npm run test:integration:coverage
    
- name: Upload Coverage Reports
  uses: actions/upload-artifact@v3
  with:
    name: integration-coverage
    path: coverage/
```

### Jenkins Pipeline
```groovy
stage('Integration Tests') {
  steps {
    sh 'npm run dev:server &'
    sh 'sleep 10'
    sh 'npm run test:integration:coverage'
    publishHTML([
      allowMissing: false,
      alwaysLinkToLastBuild: true,
      keepAll: true,
      reportDir: 'coverage/lcov-report',
      reportFiles: 'index.html',
      reportName: 'Integration Test Coverage'
    ])
  }
}
```

## 📈 Coverage Reporting

### Jest Coverage Configuration
```javascript
// jest.config.cjs
module.exports = {
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/**/*.test.js',
    '!server/config/**',
    '!server/migrations/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Coverage Reports
```bash
# Generate coverage report
npm run test:integration:coverage

# View coverage in browser
open coverage/lcov-report/index.html

# Generate coverage badge
npx jest-coverage-badges
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Server Not Running
```bash
Error: connect ECONNREFUSED 127.0.0.1:5000
```
**Solution**: Start the server before running tests
```bash
npm run dev:server
```

#### 2. Database Connection Issues
```bash
Error: MongoDB connection failed
```
**Solution**: Ensure MongoDB is running and accessible
```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ismaster')"
```

#### 3. Test Data Conflicts
```bash
Error: Duplicate key error
```
**Solution**: Use unique test data with timestamps
```typescript
const testUser = {
  email: `testuser${Date.now()}@example.com`,
  password: 'password123'
};
```

#### 4. Authentication Issues
```bash
Error: Unauthorized
```
**Solution**: Ensure proper token handling
```typescript
// Store token for use in subsequent requests
const token = response.body.token;
// Use token in headers
.set('Authorization', `Bearer ${token}`)
```

### Debug Mode
```bash
# Run tests with verbose output
DEBUG=* npm run test:integration

# Run specific test with debug
npx jest --verbose tests/integration/auth.test.ts

# Run tests with Node.js inspector
node --inspect-brk node_modules/.bin/jest tests/integration/auth.test.ts
```

## 📚 Advanced Features

### Custom Matchers
```typescript
// Custom Jest matcher for API responses
expect.extend({
  toBeValidApiResponse(received) {
    const pass = received && 
      typeof received === 'object' &&
      received.status &&
      received.data;
    
    return {
      message: () => pass 
        ? 'expected response not to be valid API response'
        : 'expected response to be valid API response',
      pass
    };
  }
});

// Usage
expect(response.body).toBeValidApiResponse();
```

### Test Utilities
```typescript
// Helper function to create authenticated user
async function createAuthenticatedUser(server: any) {
  const userData = {
    name: 'Test User',
    email: `testuser${Date.now()}@example.com`,
    password: 'password123'
  };

  const registerResponse = await request(server)
    .post('/api/auth/register')
    .send(userData);

  return {
    user: registerResponse.body.user,
    token: registerResponse.body.token
  };
}

// Helper function to create test product
async function createTestProduct(server: any, token: string, categoryId: string) {
  const productData = {
    name: `Test Product ${Date.now()}`,
    price: 99.99,
    category: categoryId,
    stock: 100
  };

  const response = await request(server)
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .send(productData);

  return response.body.product;
}
```

### Environment Configuration
```typescript
// Test environment setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';
```

## 🎉 Getting Started

### 1. Install Dependencies
```bash
npm install --save-dev supertest @types/supertest jest-environment-node
```

### 2. Start Development Server
```bash
npm run dev:server
```

### 3. Run Integration Tests
```bash
# Run all tests
npm run test:integration

# Run with coverage
npm run test:integration:coverage

# Run specific test
npm run test:integration:auth
```

### 4. View Results
```bash
# Open coverage report
open coverage/lcov-report/index.html

# Run automated tests
./tests/integration/run-integration-tests.sh
```

---

**Your Supertest Integration Testing Suite is now ready!** 🔧✨

This comprehensive setup provides:
- ✅ **Complete API testing** for all endpoints
- ✅ **Authentication and authorization** testing
- ✅ **Data validation and error handling** testing
- ✅ **Performance and security** testing
- ✅ **Automated testing workflows** for easy execution
- ✅ **Coverage reporting** for code quality metrics
- ✅ **CI/CD integration** capabilities
- ✅ **Best practices** and troubleshooting guides
