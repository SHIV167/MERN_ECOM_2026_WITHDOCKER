// Artillery test processor for dynamic data generation and custom logic

module.exports = {
  // Generate random test data
  generateTestData: function(context, events, done) {
    const emails = [
      'test1@example.com',
      'test2@example.com', 
      'test3@example.com',
      'perfuser@example.com',
      'loadtest@example.com'
    ];
    
    const passwords = ['password123', 'testpass', 'demo123'];
    const productNames = ['Laptop', 'Phone', 'Tablet', 'Monitor', 'Keyboard'];
    const prices = [99.99, 199.99, 299.99, 499.99, 999.99];
    
    context.vars.email = emails[Math.floor(Math.random() * emails.length)];
    context.vars.password = passwords[Math.floor(Math.random() * passwords.length)];
    context.vars.productName = productNames[Math.floor(Math.random() * productNames.length)];
    context.vars.price = prices[Math.floor(Math.random() * prices.length)];
    
    return done();
  },
  
  // Custom logging function
  logRequest: function(requestParams, context, ee, next) {
    console.log(`[${new Date().toISOString()}] ${requestParams.method} ${requestParams.path}`);
    return next();
  },
  
  // Handle authentication token storage
  storeAuthToken: function(requestParams, response, context, ee, next) {
    if (response.body) {
      try {
        const body = JSON.parse(response.body);
        if (body.token) {
          context.vars.authToken = body.token;
          console.log('Auth token stored successfully');
        }
      } catch (e) {
        console.log('Failed to parse response body');
      }
    }
    return next();
  },
  
  // Custom error handling
  handleErrors: function(requestParams, response, context, ee, next) {
    if (response.statusCode >= 400) {
      console.log(`Error: ${response.statusCode} for ${requestParams.method} ${requestParams.path}`);
      console.log(`Response: ${response.body}`);
    }
    return next();
  },
  
  // Performance metrics collection
  collectMetrics: function(context, events, done) {
    const now = new Date();
    context.vars.timestamp = now.toISOString();
    context.vars.testRunId = now.getTime();
    
    console.log(`Starting test run: ${context.vars.testRunId}`);
    return done();
  },
  
  // Dynamic user data generation
  generateUserData: function(context, events, done) {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    
    context.vars.email = `perfuser_${timestamp}_${randomId}@example.com`;
    context.vars.password = 'password123';
    context.vars.name = `Performance Test User ${timestamp}`;
    context.vars.phone = `+1234567890${timestamp.toString().slice(-4)}`;
    
    return done();
  },
  
  // Dynamic product data generation
  generateProductData: function(context, events, done) {
    const categories = ['electronics', 'clothing', 'books', 'home', 'sports'];
    const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG'];
    const adjectives = ['Amazing', 'Premium', 'Professional', 'Advanced', 'Smart'];
    
    context.vars.category = categories[Math.floor(Math.random() * categories.length)];
    context.vars.brand = brands[Math.floor(Math.random() * brands.length)];
    context.vars.adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    context.vars.price = (Math.random() * 1000 + 10).toFixed(2);
    context.vars.stock = Math.floor(Math.random() * 100) + 1;
    context.vars.rating = (Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0
    
    return done();
  },
  
  // Custom think time calculation
  calculateThinkTime: function(context, events, done) {
    // Dynamic think time based on load
    const baseThinkTime = 1000; // 1 second
    const loadFactor = context.vars.arrivalRate || 10;
    const adjustedThinkTime = baseThinkTime / (loadFactor / 10);
    
    context.vars.thinkTime = Math.max(100, adjustedThinkTime); // Minimum 100ms
    return done();
  },
  
  // Response time validation
  validateResponseTime: function(requestParams, response, context, ee, next) {
    const maxResponseTime = 2000; // 2 seconds
    if (response.responseTime > maxResponseTime) {
      console.log(`SLOW RESPONSE: ${response.responseTime}ms for ${requestParams.method} ${requestParams.path}`);
    }
    return next();
  },
  
  // Memory usage tracking
  trackMemoryUsage: function(context, events, done) {
    const memoryUsage = process.memoryUsage();
    context.vars.memoryUsage = {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external
    };
    
    console.log(`Memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
    return done();
  }
};
