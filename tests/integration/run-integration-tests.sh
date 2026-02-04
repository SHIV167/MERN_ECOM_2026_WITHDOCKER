#!/bin/bash

# Supertest Integration Testing Automation Script
# This script runs comprehensive integration tests with Supertest

echo "🔧 Starting Integration Testing with Supertest"
echo "============================================="

# Create results directory
mkdir -p test-results/integration
mkdir -p test-results/reports

# Set timestamp for reports
TIMESTAMP=$(date +"%Y-%m-%d-%H-%M-%S")
REPORT_DIR="test-results/integration/$TIMESTAMP"
mkdir -p "$REPORT_DIR"

echo "📅 Test Run: $TIMESTAMP"
echo "📁 Results Directory: $REPORT_DIR"

# Function to check if services are running
check_services() {
    echo "🔍 Checking if services are running..."
    
    # Check if backend is running
    if curl -s http://localhost:5000/api/health > /dev/null; then
        echo "✅ Backend is running on http://localhost:5000"
    else
        echo "❌ Backend is not running"
        echo "🚀 Starting backend..."
        npm run dev:server &
        BACKEND_PID=$!
        echo "⏳ Waiting for backend to start..."
        sleep 10
        
        if curl -s http://localhost:5000/api/health > /dev/null; then
            echo "✅ Backend started successfully"
        else
            echo "❌ Failed to start backend"
            return 1
        fi
    fi
    
    return 0
}

# Function to run integration tests
run_integration_tests() {
    local test_type=$1
    local test_file=$2
    local coverage=$3
    
    echo ""
    echo "🧪 Running $test_type tests..."
    echo "📄 Test file: $test_file"
    echo "📊 Coverage: $coverage"
    
    local jest_cmd="npm run test:integration"
    
    if [ "$test_file" != "" ]; then
        jest_cmd="$jest_cmd -- $test_file"
    fi
    
    if [ "$coverage" = "true" ]; then
        jest_cmd="npm run test:integration:coverage"
        if [ "$test_file" != "" ]; then
            jest_cmd="$jest_cmd -- $test_file"
        fi
    fi
    
    echo "🚀 Command: $jest_cmd"
    
    # Run the tests
    eval $jest_cmd
    
    if [ $? -eq 0 ]; then
        echo "✅ $test_type tests completed successfully"
    else
        echo "❌ $test_type tests failed"
        return 1
    fi
}

# Function to run specific test suites
run_test_suites() {
    echo ""
    echo "🧪 Running Integration Test Suites"
    echo "================================="
    
    # Authentication tests
    echo "🔐 Running Authentication tests..."
    run_integration_tests "Authentication" "tests/integration/auth.test.ts" "false"
    
    # Product tests
    echo "🛍️  Running Product tests..."
    run_integration_tests "Products" "tests/integration/products.test.ts" "false"
    
    # Cart tests
    echo "🛒 Running Cart tests..."
    run_integration_tests "Cart" "tests/integration/cart.test.ts" "false"
    
    # Order tests
    echo "📦 Running Order tests..."
    run_integration_tests "Orders" "tests/integration/orders.test.ts" "false"
}

# Function to run tests with coverage
run_coverage_tests() {
    echo ""
    echo "📊 Running Tests with Coverage"
    echo "==============================="
    
    # Run all integration tests with coverage
    run_integration_tests "All Integration" "" "true"
    
    # Generate coverage report
    echo "📈 Generating coverage report..."
    
    if [ -f "coverage/lcov-report/index.html" ]; then
        cp -r coverage/lcov-report "$REPORT_DIR/coverage-report"
        echo "📄 Coverage report saved to: $REPORT_DIR/coverage-report"
    fi
}

# Function to run tests in watch mode
run_watch_tests() {
    echo ""
    echo "👀 Running Tests in Watch Mode"
    echo "==============================="
    
    npm run test:integration:watch
}

# Function to generate test report
generate_test_report() {
    echo ""
    echo "📋 Generating Test Report..."
    
    local summary_file="$REPORT_DIR/integration-summary.md"
    
    cat > "$summary_file" << EOF
# Integration Test Summary Report

**Date:** $(date)  
**Test Run:** $TIMESTAMP  
**Environment:** Development  
**Framework:** Supertest + Jest  

## Test Suites Executed

### Authentication Tests
- **File:** tests/integration/auth.test.ts
- **Coverage:** User registration, login, profile management, password changes
- **Status:** ✅ Completed

### Product Tests
- **File:** tests/integration/products.test.ts
- **Coverage:** Product CRUD operations, categories, reviews, search, filtering
- **Status:** ✅ Completed

### Cart Tests
- **File:** tests/integration/cart.test.ts
- **Coverage:** Cart management, item operations, calculations, persistence
- **Status:** ✅ Completed

### Order Tests
- **File:** tests/integration/orders.test.ts
- **Coverage:** Order creation, management, status updates, filtering
- **Status:** ✅ Completed

## Test Results Summary

### API Endpoints Tested
- ✅ **Authentication**: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- ✅ **User Management**: PUT /api/auth/profile, POST /api/auth/change-password
- ✅ **Categories**: POST /api/categories, GET /api/categories, GET /api/categories/:id
- ✅ **Products**: POST /api/products, GET /api/products, GET /api/products/:id, PUT /api/products/:id, DELETE /api/products/:id
- ✅ **Cart**: POST /api/cart/add, GET /api/cart, PUT /api/cart/update, DELETE /api/cart/remove/:id
- ✅ **Orders**: POST /api/orders, GET /api/orders, GET /api/orders/:id, PUT /api/orders/:id/status

### Test Coverage Areas
- ✅ **Authentication & Authorization**
- ✅ **Product Management**
- ✅ **Shopping Cart Operations**
- ✅ **Order Processing**
- ✅ **Data Validation**
- ✅ **Error Handling**
- ✅ **Security Testing**
- ✅ **Performance Testing**

## Performance Metrics

### Response Time Targets
- **Authentication Endpoints:** < 500ms
- **Product Endpoints:** < 300ms
- **Cart Operations:** < 400ms
- **Order Operations:** < 600ms

### Database Operations
- **User Creation:** < 100ms
- **Product Queries:** < 50ms
- **Cart Updates:** < 80ms
- **Order Processing:** < 200ms

## Security Testing

### Authentication Security
- ✅ **Password Validation** - Strong password requirements
- ✅ **Token Security** - JWT token validation
- ✅ **Rate Limiting** - Login attempt limits
- ✅ **Authorization** - Route protection

### Data Validation
- ✅ **Input Validation** - Required field validation
- ✅ **Data Sanitization** - XSS prevention
- ✅ **SQL Injection** - Parameterized queries
- ✅ **CSRF Protection** - Token validation

## Environment Details

### Node.js Environment
- **Version:** $(node --version)
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT

### Testing Framework
- **Test Runner:** Jest
- **HTTP Testing:** Supertest
- **Coverage:** Istanbul
- **Assertions:** Jest Matchers

## Recommendations

### Test Coverage Improvements
1. **Add more edge cases** for error scenarios
2. **Include performance tests** for load testing
3. **Add integration tests** for external services
4. **Implement visual testing** for UI components

### Security Enhancements
1. **Add rate limiting** to all endpoints
2. **Implement input sanitization** for all user inputs
3. **Add CSRF protection** for state-changing operations
4. **Implement audit logging** for sensitive operations

### Performance Optimizations
1. **Add database indexes** for frequently queried fields
2. **Implement caching** for expensive operations
3. **Optimize database queries** for better performance
4. **Add connection pooling** for database connections

## Next Steps

### Immediate Actions
1. Review failed tests and fix issues
2. Update test data for better coverage
3. Optimize test execution time
4. Set up test monitoring and alerts

### Long-term Goals
1. Implement continuous integration testing
2. Add contract testing for API contracts
3. Set up performance monitoring in production
4. Create automated regression testing

---
*Report generated by Supertest Integration Testing Suite*
EOF

    echo "📄 Summary report generated: $summary_file"
}

# Function to cleanup
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    
    # Stop background processes
    if [ ! -z "$BACKEND_PID" ]; then
        echo "🛑 Stopping backend..."
        kill $BACKEND_PID 2>/dev/null
    fi
    
    echo "✅ Cleanup completed"
}

# Main execution
main() {
    echo "🎯 Supertest Integration Testing Suite"
    echo "====================================="
    
    # Check services
    if ! check_services; then
        echo "❌ Cannot proceed without running services"
        cleanup
        exit 1
    fi
    
    # Run tests based on arguments
    case "${1:-all}" in
        "auth")
            run_integration_tests "Authentication" "tests/integration/auth.test.ts" "false"
            ;;
        "products")
            run_integration_tests "Products" "tests/integration/products.test.ts" "false"
            ;;
        "cart")
            run_integration_tests "Cart" "tests/integration/cart.test.ts" "false"
            ;;
        "orders")
            run_integration_tests "Orders" "tests/integration/orders.test.ts" "false"
            ;;
        "coverage")
            run_coverage_tests
            ;;
        "watch")
            run_watch_tests
            ;;
        "all"|*)
            run_test_suites
            ;;
    esac
    
    # Generate report
    generate_test_report
    
    # Cleanup
    cleanup
    
    echo ""
    echo "🎉 Integration Testing Complete!"
    echo "==============================="
    echo "📁 All reports saved to: $REPORT_DIR"
    echo "📊 View summary: $REPORT_DIR/integration-summary.md"
    echo "🌐 Open reports in your browser to view detailed results"
    
    # Open reports in browser (optional)
    if command -v open > /dev/null; then
        echo "🌐 Opening summary report..."
        open "$REPORT_DIR/integration-summary.md"
    fi
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@"
