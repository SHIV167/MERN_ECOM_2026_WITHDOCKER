# 🚀 Performance Testing with Artillery - Complete Guide

## 📋 Overview

Artillery is a modern, powerful load testing toolkit that makes it easy to test the performance of your Node.js applications. It's perfect for testing API endpoints, web applications, and microservices.

## 🚀 Quick Setup

### 1. Install Artillery
```bash
# Install Artillery globally
npm install -g artillery

# Verify installation
artillery --version

# Install Artillery plugins for enhanced testing
npm install -g artillery-plugin-metrics-by-endpoint
```

### 2. Update Package Scripts

I've already updated your package.json to include Artillery performance testing scripts:

```json
{
  "scripts": {
    "test:performance": "artillery run tests/performance/load-test.yml",
    "test:performance:report": "artillery run tests/performance/load-test.yml --output test-results/performance.json",
    "test:performance:html": "artillery run tests/performance/load-test.yml --output test-results/performance.json && artillery report test-results/performance.json",
    "test:performance:stress": "artillery run tests/performance/stress-test.yml",
    "test:performance:spike": "artillery run tests/performance/spike-test.yml",
    "test:performance:endurance": "artillery run tests/performance/endurance-test.yml"
  }
}
```

## 📁 Project Structure

```
tests/performance/
├── load-test.yml              # Basic load testing configuration
├── stress-test.yml            # High-load stress testing
├── spike-test.yml             # Sudden traffic spike testing
├── endurance-test.yml         # Long-duration endurance testing
├── test-processor.js          # Custom test logic and data generation
├── test-data.csv             # Test data for dynamic scenarios
├── run-performance-tests.sh   # Linux/Mac automation script
└── run-performance-tests.bat  # Windows automation script
```

## 🧪 Test Configurations

### 1. Load Test (load-test.yml)
- **Duration**: 4 minutes
- **Phases**: Warm up → Load test → Peak load
- **Arrival Rates**: 10 → 50 → 100 users/second
- **Scenarios**: Registration, Login, Browse Products, Search, Categories

### 2. Stress Test (stress-test.yml)
- **Duration**: 6 minutes
- **Phases**: Initial → Increasing → High → Maximum → Stress → Peak
- **Arrival Rates**: 5 → 20 → 50 → 100 → 150 → 200 users/second
- **Purpose**: Find breaking point and performance limits

### 3. Spike Test (spike-test.yml)
- **Duration**: 4 minutes
- **Phases**: Baseline → Spike → Recovery → Major spike → Final recovery
- **Arrival Rates**: 10 → 500 → 10 → 1000 → 10 users/second
- **Purpose**: Test sudden traffic spikes and recovery

### 4. Endurance Test (endurance-test.yml)
- **Duration**: 25 minutes
- **Phases**: 5min → 10min → 15min sustained load
- **Arrival Rates**: 20 → 30 → 40 users/second
- **Purpose**: Test long-term stability and memory leaks

## 🚀 Quick Start Commands

### Basic Performance Test
```bash
# Run basic load test
npm run test:performance

# Run with JSON output
npm run test:performance:report

# Run with HTML report
npm run test:performance:html
```

### Advanced Testing
```bash
# Run stress test
npm run test:performance:stress

# Run spike test
npm run test:performance:spike

# Run endurance test
npm run test:performance:endurance
```

### Automated Testing
```bash
# Linux/Mac - Run all tests with reports
chmod +x tests/performance/run-performance-tests.sh
./tests/performance/run-performance-tests.sh

# Windows - Run all tests with reports
tests\performance\run-performance-tests.bat
```

## 📊 Test Scenarios

### 1. User Registration and Login
```yaml
- post:
    url: "/api/auth/register"
    headers:
      Content-Type: "application/json"
    json:
      email: "{{ email }}"
      password: "{{ password }}"
      name: "Performance Test User"
  capture:
    - json: "$.user._id"
      as: "userId"
  expect:
    - statusCode: 201
```

### 2. Product Browsing
```yaml
- get:
    url: "/api/products"
  expect:
    - statusCode: 200
    - contentType: "application/json"

- loop:
    - get:
        url: "/api/products/{{ $randomInt(1, 20) }}"
    count: 5
```

### 3. Search and Filter
```yaml
- get:
    url: "/api/products?search=laptop"
  expect:
    - statusCode: 200

- get:
    url: "/api/products?category=electronics"
  expect:
    - statusCode: 200
```

## 🔧 Custom Test Processor

The `test-processor.js` file provides:

### Dynamic Data Generation
```javascript
module.exports = {
  generateUserData: function(context, events, done) {
    const timestamp = Date.now();
    context.vars.email = `perfuser_${timestamp}@example.com`;
    context.vars.password = 'password123';
    return done();
  }
};
```

### Custom Logging
```javascript
logRequest: function(requestParams, context, ee, next) {
  console.log(`[${new Date().toISOString()}] ${requestParams.method} ${requestParams.path}`);
  return next();
}
```

### Performance Metrics
```javascript
validateResponseTime: function(requestParams, response, context, ee, next) {
  const maxResponseTime = 2000; // 2 seconds
  if (response.responseTime > maxResponseTime) {
    console.log(`SLOW RESPONSE: ${response.responseTime}ms`);
  }
  return next();
}
```

## 📈 Performance Targets

### Response Time Targets
- **Health Check**: < 100ms
- **Product List**: < 500ms
- **Product Details**: < 300ms
- **Categories**: < 200ms
- **Authentication**: < 1000ms

### Throughput Targets
- **Normal Load**: 50+ requests/second
- **Peak Load**: 100+ requests/second
- **Stress Test**: 200+ requests/second

### Error Rate Targets
- **Normal Load**: < 1%
- **Peak Load**: < 2%
- **Stress Test**: < 5%

## 📊 Report Generation

### HTML Reports
```bash
# Generate HTML report
artillery run tests/performance/load-test.yml --output results.json
artillery report results.json --output performance-report.html
```

### JSON Reports
```bash
# Generate JSON report for CI/CD
artillery run tests/performance/load-test.yml --output results.json
```

### Summary Reports
The automation scripts generate:
- **Individual test reports** (HTML)
- **JSON results** for programmatic analysis
- **Summary markdown report** with all test results
- **Performance recommendations**

## 🔍 Monitoring and Analysis

### Key Metrics to Monitor
1. **Response Time**: Average, median, 95th percentile
2. **Throughput**: Requests per second
3. **Error Rate**: Percentage of failed requests
4. **Virtual Users**: Active concurrent users
5. **Resource Usage**: CPU, memory, database connections

### Performance Bottlenecks
Common issues to look for:
- **Database queries**: Slow queries, missing indexes
- **Memory leaks**: Increasing memory usage over time
- **Connection limits**: Database or API connection exhaustion
- **CPU saturation**: High CPU usage under load

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
- name: Run Performance Tests
  run: |
    npm install -g artillery
    artillery run tests/performance/load-test.yml --output performance-results.json
    
- name: Upload Performance Results
  uses: actions/upload-artifact@v3
  with:
    name: performance-results
    path: performance-results.json
```

### Jenkins Pipeline
```groovy
stage('Performance Tests') {
  steps {
    sh 'npm install -g artillery'
    sh 'artillery run tests/performance/load-test.yml --output performance-results.json'
    publishHTML([
      allowMissing: false,
      alwaysLinkToLastBuild: true,
      keepAll: true,
      reportDir: '.',
      reportFiles: 'performance-report.html',
      reportName: 'Performance Report'
    ])
  }
}
```

## 🎯 Best Practices

### ✅ Do's
1. **Test in realistic environments** - Use staging/production-like setup
2. **Monitor system resources** - CPU, memory, database, network
3. **Use realistic data** - Don't test with empty databases
4. **Run tests regularly** - Include in CI/CD pipeline
5. **Analyze results** - Don't just run tests, review the data
6. **Set baselines** - Establish performance baselines and SLAs
7. **Test different scenarios** - Normal, peak, stress, spike scenarios

### ❌ Don'ts
1. **Don't test against production** unless absolutely necessary
2. **Don't ignore slow responses** - investigate all performance issues
3. **Don't use unrealistic data** - test with realistic payloads
4. **Don't forget to warm up** - include warm-up phases
5. **Don't test in isolation** - consider the full system impact
6. **Don't skip monitoring** - always monitor during tests
7. **Don't ignore failures** - investigate all test failures

## 🚨 Troubleshooting

### Common Issues

#### 1. Connection Refused
```bash
Error: connect ECONNREFUSED 127.0.0.1:5000
```
**Solution**: Ensure your server is running on the correct port

#### 2. High Error Rates
```bash
Error rate: 15.2% (threshold: 5%)
```
**Solution**: Check server logs, database connections, and resource limits

#### 3. Slow Response Times
```bash
95th percentile: 2.5s (threshold: 1s)
```
**Solution**: Profile database queries, check for memory leaks, optimize code

#### 4. Memory Issues
```bash
JavaScript heap out of memory
```
**Solution**: Increase Node.js memory limit or optimize test configuration

### Debug Mode
```bash
# Run with verbose output
DEBUG=artillery* artillery run tests/performance/load-test.yml

# Run with specific logging
artillery run tests/performance/load-test.yml --config debug.yml
```

## 📚 Advanced Features

### Custom Plugins
```javascript
// artillery-plugin-custom-metrics.js
module.exports = {
  init: (config, context, ee) => {
    context.customMetrics = {
      responseTimeSum: 0,
      requestCount: 0
    };
    return ee;
  },
  
  requestReceived: (requestParams, context, ee, next) => {
    context.customMetrics.requestCount++;
    return next();
  }
};
```

### Environment Variables
```yaml
config:
  target: '{{ $processEnvironment.BASE_URL || "http://localhost:5000" }}'
  phases:
    - duration: {{ $processEnvironment.TEST_DURATION || 60 }}
      arrivalRate: {{ $processEnvironment.ARRIVAL_RATE || 10 }}
```

### Conditional Logic
```yaml
config:
  phases:
    - duration: 60
      arrivalRate: '{{ $environment == "production" ? 5 : 20 }}'
```

## 🎉 Getting Started

### 1. Install Artillery
```bash
npm install -g artillery
```

### 2. Start Your Server
```bash
npm run dev:server
```

### 3. Run Basic Test
```bash
npm run test:performance
```

### 4. Generate Report
```bash
npm run test:performance:html
```

### 5. Analyze Results
Open the generated HTML report in your browser to analyze performance metrics.

---

**Your Artillery Performance Testing Suite is now ready!** 🚀✨

This comprehensive setup provides:
- ✅ **Multiple test types** (Load, Stress, Spike, Endurance)
- ✅ **Automated scripts** for easy execution
- ✅ **Detailed reporting** with HTML and JSON outputs
- ✅ **Custom processors** for dynamic data generation
- ✅ **CI/CD integration** capabilities
- ✅ **Best practices** and troubleshooting guides
