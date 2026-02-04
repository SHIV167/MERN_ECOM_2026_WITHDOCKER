#!/bin/bash

# testing-workflow.sh - Complete testing workflow script

set -e  # Exit on any error

echo "🧪 MERN Ecommerce Testing Workflow"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 1. Environment Check
echo "1. Checking Environment..."
print_info "Node.js version: $(node --version)"
print_info "npm version: $(npm --version)"

# Check Docker
if command -v docker &> /dev/null; then
    print_status "Docker is installed"
    docker --version
else
    print_warning "Docker not found - some tests may fail"
fi

# Check test dependencies
echo ""
echo "2. Checking Test Dependencies..."
if npm list jest &> /dev/null; then
    print_status "Jest is installed"
else
    print_error "Jest not found - installing..."
    npm install --save-dev jest
fi

if npm list cypress &> /dev/null; then
    print_status "Cypress is installed"
else
    print_warning "Cypress not found - E2E tests may fail"
fi

# 3. Start Services
echo ""
echo "3. Starting Services..."
if command -v docker-compose &> /dev/null; then
    print_info "Starting Docker services..."
    docker-compose up -d mongodb redis
    
    # Wait for services to start
    print_info "Waiting for services to start..."
    sleep 10
    
    # Check if services are running
    if docker ps | grep -q "mongo"; then
        print_status "MongoDB is running"
    else
        print_error "MongoDB failed to start"
    fi
    
    if docker ps | grep -q "redis"; then
        print_status "Redis is running"
    else
        print_warning "Redis not running - tests will use mocks"
    fi
else
    print_warning "Docker Compose not found - skipping service startup"
fi

# 4. Run Tests
echo ""
echo "4. Running Tests..."

# Run unit tests
echo ""
print_info "Running Unit Tests..."
if npm run test:unit; then
    print_status "Unit tests passed"
else
    print_error "Unit tests failed"
fi

# Run integration tests (if they exist)
echo ""
print_info "Running Integration Tests..."
if npm run test:integration 2>/dev/null; then
    print_status "Integration tests passed"
else
    print_warning "Integration tests not available or failed"
fi

# Generate coverage report
echo ""
print_info "Generating Coverage Report..."
if npm run test:coverage; then
    print_status "Coverage report generated"
    print_info "View coverage: open coverage/lcov-report/index.html"
else
    print_error "Coverage report failed"
fi

# 5. Run API Tests (if Newman is available)
echo ""
if command -v newman &> /dev/null; then
    print_info "Running API Tests..."
    if [ -f "tests/postman/ecommerce-api.postman_collection.json" ]; then
        newman run tests/postman/ecommerce-api.postman_collection.json \
            --reporters cli,junit \
            --reporter-junit-export api-test-results.xml
        print_status "API tests completed"
    else
        print_warning "API test collection not found"
    fi
else
    print_warning "Newman not installed - skipping API tests"
fi

# 6. Generate Test Report
echo ""
echo "5. Generating Test Report..."

REPORT_FILE="test-report-$(date +%Y-%m-%d-%H-%M-%S).md"

cat > "$REPORT_FILE" << EOF
# Test Report

**Date:** $(date)
**Environment:** $(node --version)

## Test Results

### Unit Tests
\`\`\`
$(npm run test:unit 2>&1 | tail -10)
\`\`\`

### Coverage Report
\`\`\`
$(npm run test:coverage 2>&1 | tail -10)
\`\`\`

### Services Status
\`\`\`
$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "Docker not available")
\`\`\`

### Next Steps
1. Review coverage report: \`open coverage/lcov-report/index.html\`
2. Check failed tests and fix issues
3. Add more tests to improve coverage
4. Set up CI/CD for automated testing

EOF

print_status "Test report generated: $REPORT_FILE"

# 7. Cleanup
echo ""
echo "6. Cleanup..."
print_info "Stopping Docker services..."
docker-compose down 2>/dev/null || print_warning "Docker Compose not available"

# 8. Summary
echo ""
echo "=================================="
echo "🎉 Testing Workflow Complete!"
echo ""
echo "📊 Reports Generated:"
echo "   - Coverage Report: coverage/lcov-report/index.html"
echo "   - Test Summary: $REPORT_FILE"
echo "   - API Results: api-test-results.xml (if available)"
echo ""
echo "🔧 Next Steps:"
echo "   1. Review coverage report and improve test coverage"
echo "   2. Fix any failed tests"
echo "   3. Add more integration and E2E tests"
echo "   4. Set up CI/CD pipeline for automated testing"
echo ""
echo "📞 For help, see: TESTING_WORKFLOW.md"
echo "=================================="
