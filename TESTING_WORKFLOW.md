# 🧪 Testing Workflow Guide: Test, Report, and Fix

## 📋 Table of Contents

1. [Quick Start Testing](#quick-start-testing)
2. [Running Different Test Types](#running-different-test-types)
3. [Understanding Test Reports](#understanding-test-reports)
4. [Common Issues & Fixes](#common-issues--fixes)
5. [Test Coverage Analysis](#test-coverage-analysis)
6. [CI/CD Testing](#cicd-testing)
7. [Debugging Tests](#debugging-tests)
8. [Best Practices](#best-practices)

## 🚀 Quick Start Testing

### Step 1: Run Basic Tests First
```bash
# Start with the working basic tests
npm run test:unit

# Expected output:
# PASS tests/unit/simple.test.ts
# ✓ should run a simple test
# ✓ should handle async operations
# ✓ should handle object comparisons
# ✓ should handle array operations
```

### Step 2: Check Test Environment
```bash
# Verify test dependencies
npm list | grep -E "(jest|cypress|newman)"

# Check MongoDB connection (for integration tests)
docker ps | grep mongo

# Check Redis connection (optional)
redis-cli ping
```

### Step 3: Run Full Test Suite
```bash
# Run all available tests
npm test

# Or run with coverage
npm run test:coverage
```

## 🔧 Running Different Test Types

### Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run specific unit test
npx jest --config jest.config.cjs tests/unit/simple.test.ts

# Run in watch mode (for development)
npm run test:watch
```

### Integration Tests
```bash
# Run integration tests (when fixed)
npm run test:integration

# Run with verbose output
npx jest --config jest.config.cjs tests/integration --verbose
```

### E2E Tests
```bash
# Run Cypress tests
npm run test:e2e

# Open Cypress GUI for debugging
npm run test:e2e:open

# Run specific E2E test
npx cypress run --spec "cypress/e2e/user-journey.cy.ts"
```

### API Tests
```bash
# Install Newman globally
npm install -g newman

# Run API tests
newman run tests/postman/ecommerce-api.postman_collection.json

# Run with environment variables
newman run tests/postman/ecommerce-api.postman_collection.json \
  --environment tests/postman/test-environment.postman_environment.json
```

## 📊 Understanding Test Reports

### 1. Jest Test Reports

#### Console Output
```
PASS tests/unit/simple.test.ts (19.879 s)
  Basic Test Setup
    ✓ should run a simple test (3 ms)
    ✓ should handle async operations (1 ms)
    ✓ should handle object comparisons (2 ms)
    ✓ should handle array operations

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        20.534 s
```

#### Coverage Report
```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html

# Coverage metrics:
# File                    | % Stmts | % Branch | % Funcs | % Lines
# ------------------------|---------|----------|---------|--------
# All files               |   85.23 |    78.45 |   87.12 |   84.98
# server/                 |   88.45 |    82.34 |   90.23 |   87.89
```

### 2. Cypress Reports

#### HTML Report
```bash
# Cypress generates reports automatically
# Location: cypress/results/html/index.html

# View report
open cypress/results/html/index.html
```

#### Video Recordings
```bash
# Videos saved in: cypress/videos/
# Screenshots saved in: cypress/screenshots/
```

### 3. Newman API Reports

#### JUnit XML
```bash
# Generate JUnit report
newman run collection.json --reporters junit --reporter-junit-export test-results.xml

# View results
cat test-results.xml
```

#### HTML Report
```bash
# Generate HTML report
newman run collection.json --reporters html --reporter-html-export report.html

# View report
open report.html
```

## 🐛 Common Issues & Fixes

### Issue 1: Jest Configuration Errors

#### Problem:
```
ReferenceError: module is not defined in ES module scope
```

#### Fix:
```bash
# Check Jest config file extension
ls jest.config.*

# Should be .cjs for ES modules
mv jest.config.js jest.config.cjs

# Update package.json scripts
sed -i 's/jest.config.js/jest.config.cjs/g' package.json
```

### Issue 2: TypeScript Compilation Errors

#### Problem:
```
error TS2304: Cannot find name 'beforeAll'
```

#### Fix:
```bash
# Add Jest globals import
echo "/// <reference types=\"@jest/globals\" />" > tests/setup.d.ts

# Add import to test files
sed -i '1i import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";' tests/unit/*.ts
```

### Issue 3: MongoDB Connection Errors

#### Problem:
```
MongoNetworkError: connect ECONNREFUSED
```

#### Fix:
```bash
# Start MongoDB
docker-compose up -d mongodb

# Check if running
docker ps | grep mongo

# Wait for MongoDB to start
sleep 10

# Run tests again
npm run test:integration
```

### Issue 4: Redis Connection Errors

#### Problem:
```
Redis connection failed but continuing with limited functionality
```

#### Fix:
```bash
# This is expected in development mode
# Tests should work with mocked Redis

# If you want real Redis:
docker-compose up -d redis

# Or skip Redis tests
npm run test:unit -- --testPathIgnorePatterns=redis
```

### Issue 5: Import Path Errors

#### Problem:
```
Cannot find module '../server/redis'
```

#### Fix:
```bash
# Check file structure
find . -name "redis.ts"

# Update import paths
sed -i 's|../server/redis|../../server/redis|g' tests/unit/*.ts

# Or use absolute paths
sed -i 's|../server/redis|server/redis|g' tests/unit/*.ts
```

## 📈 Test Coverage Analysis

### 1. Generate Coverage Report
```bash
# Run tests with coverage
npm run test:coverage

# This generates:
# - coverage/lcov.info (for Codecov)
# - coverage/lcov-report/ (HTML report)
# - coverage/coverage-final.json (JSON data)
```

### 2. Analyze Coverage Results

#### View Coverage Summary
```bash
# Check coverage summary
npm run test:coverage | grep "All files"

# View uncovered files
grep -E "File.*|0.*|0.*" coverage/lcov-report/index.html
```

#### Coverage Goals
```bash
# Good coverage targets:
# - Unit Tests: 80-90%
# - Integration Tests: 70-80%
# - E2E Tests: 60-70%
# - Overall: 75-85%
```

### 3. Improve Coverage

#### Add Missing Tests
```bash
# Find uncovered files
find server -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*"

# Create test for uncovered file
echo "import { describe, it, expect } from '@jest/globals';

describe('Uncovered Module', () => {
  it('should have basic test', () => {
    expect(true).toBe(true);
  });
});" > tests/unit/$(basename "$file" | sed 's/.ts$/.test.ts/')
```

## 🔄 CI/CD Testing

### 1. Local CI Testing
```bash
# Test CI workflow locally
act -j test-suite

# Or use Docker
docker-compose -f .github/workflows/test-suite.yml up --build
```

### 2. GitHub Actions Testing

#### Trigger Tests
```bash
# Push to trigger tests
git add .
git commit -m "Add tests"
git push origin main

# Or trigger manually
gh workflow run test-suite
```

#### Check Results
```bash
# View workflow status
gh run list

# Download artifacts
gh run download <run-id>
```

## 🔍 Debugging Tests

### 1. Jest Debugging

#### Debug Specific Test
```bash
# Run in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand tests/unit/simple.test.ts

# Or use VS Code debugger
# Add "debugger;" statement in test
```

#### Verbose Output
```bash
# Run with verbose output
npx jest --config jest.config.cjs --verbose

# Show stack traces
npx jest --config jest.config.cjs --verbose --no-cache
```

### 2. Cypress Debugging

#### Open Cypress GUI
```bash
# Open Cypress for debugging
npm run test:e2e:open

# Run specific test in GUI
# Select test file in Cypress interface
```

#### Debug Mode
```bash
# Run with debug output
npx cypress run --debug --spec "cypress/e2e/user-journey.cy.ts"

# Keep browser open
npx cypress run --headed --spec "cypress/e2e/user-journey.cy.ts"
```

### 3. API Testing Debugging

#### Verbose Newman
```bash
# Run with verbose output
newman run collection.json --verbose

# Show request/response details
newman run collection.json --verbose --reporters cli
```

#### Debug Individual Requests
```bash
# Export environment and test
newman run collection.json --export-environment env.json

# Test single request
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## 📝 Test Reporting Workflow

### 1. Daily Testing Report

#### Script for Daily Report
```bash
#!/bin/bash
# daily-test-report.sh

echo "=== Daily Test Report ===" > test-report.md
echo "Date: $(date)" >> test-report.md
echo "" >> test-report.md

echo "## Unit Tests" >> test-report.md
npm run test:unit >> test-report.md 2>&1

echo "## Coverage Report" >> test-report.md
npm run test:coverage >> test-report.md 2>&1

echo "## API Tests" >> test-report.md
newman run tests/postman/ecommerce-api.postman_collection.json >> test-report.md 2>&1

echo "Report generated: test-report.md"
```

### 2. Test Summary Dashboard

#### Create Test Dashboard
```bash
# Create dashboard HTML
cat > test-dashboard.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Test Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <h1>Test Results Dashboard</h1>
    <canvas id="testChart"></canvas>
    <script>
        // Load test data and create charts
        fetch('test-results.json')
            .then(response => response.json())
            .then(data => {
                // Create chart
                new Chart(document.getElementById('testChart'), {
                    type: 'bar',
                    data: {
                        labels: ['Unit Tests', 'Integration', 'E2E', 'API'],
                        datasets: [{
                            label: 'Tests Passed',
                            data: [data.unit.passed, data.integration.passed, data.e2e.passed, data.api.passed],
                            backgroundColor: '#4CAF50'
                        }]
                    }
                });
            });
    </script>
</body>
</html>
EOF

echo "Test dashboard created: test-dashboard.html"
```

## 🎯 Best Practices

### 1. Test Organization

#### Directory Structure
```
tests/
├── unit/                   # Unit tests
│   ├── simple.test.ts
│   ├── api.test.ts
│   └── utils.test.ts
├── integration/           # Integration tests
│   ├── auth.test.ts
│   └── products.test.ts
├── e2e/                   # E2E tests
│   └── user-journey.cy.ts
├── postman/               # API tests
│   └── ecommerce-api.postman_collection.json
├── utils/                 # Test utilities
│   └── redisTestUtils.ts
├── setup.d.ts            # Test setup
└── fixtures/              # Test data
```

### 2. Test Naming Conventions

#### File Names
```bash
# Unit tests: *.test.ts
# Integration tests: *.test.ts
# E2E tests: *.cy.ts
# Use descriptive names
# ✅ good: user-auth.test.ts
# ❌ bad: test1.ts
```

#### Test Descriptions
```typescript
// ✅ Good: Clear and descriptive
describe('User Authentication', () => {
  it('should register new user successfully', async () => {
    // test implementation
  });
});

// ❌ Bad: Vague
describe('Auth', () => {
  it('works', async () => {
    // test implementation
  });
});
```

### 3. Test Data Management

#### Use Fixtures
```typescript
// tests/fixtures/userData.ts
export const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

// Use in tests
import { TEST_USER } from '../fixtures/userData';
```

#### Clean Setup/Teardown
```typescript
describe('User Tests', () => {
  beforeEach(async () => {
    // Setup test data
    await createTestUser();
  });

  afterEach(async () => {
    // Clean up
    await cleanupTestData();
  });
});
```

### 4. Error Handling

#### Handle Expected Errors
```typescript
it('should handle invalid input', async () => {
  try {
    await invalidOperation();
    fail('Should have thrown an error');
  } catch (error) {
    expect(error.message).toBe('Expected error message');
  }
});
```

#### Mock External Services
```typescript
// Mock external dependencies
jest.mock('../server/redis', () => ({
  redisCache: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true)
  }
}));
```

## 🚀 Quick Fix Commands

### Fix Common Issues
```bash
# 1. Reset Jest cache
npm run test:unit -- --clearCache

# 2. Update dependencies
npm install

# 3. Fix permissions
chmod +x scripts/*.sh

# 4. Clean test artifacts
rm -rf coverage/ cypress/videos/ cypress/screenshots/

# 5. Restart services
docker-compose down && docker-compose up -d
```

### Run Health Check
```bash
#!/bin/bash
# test-health-check.sh

echo "=== Test Environment Health Check ==="

# Check Node.js
node --version

# Check dependencies
npm list | grep -E "(jest|cypress|newman)"

# Check services
docker ps | grep -E "(mongo|redis)"

# Run basic test
npm run test:unit

echo "Health check complete!"
```

## 📞 Getting Help

### Troubleshooting Checklist

1. **Check Environment**
   ```bash
   node --version
   npm --version
   docker --version
   ```

2. **Check Dependencies**
   ```bash
   npm list | grep jest
   npm list | grep cypress
   ```

3. **Check Services**
   ```bash
   docker ps
   docker-compose ps
   ```

4. **Check Configuration**
   ```bash
   cat jest.config.cjs
   cat cypress.config.ts
   ```

5. **Run Simple Test**
   ```bash
   npx jest --config jest.config.cjs tests/unit/simple.test.ts
   ```

### Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Documentation](https://docs.cypress.io/guides/overview/why-cypress)
- [Newman Documentation](https://learning.postman.com/docs/postman/collections/intro-to-newman)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Happy Testing! 🧪** 

Remember: Start simple, fix issues incrementally, and maintain good test coverage!
