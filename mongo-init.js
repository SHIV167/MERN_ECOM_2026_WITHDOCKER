// MongoDB initialization script
db = db.getSiblingDB('newecom');

// Create application user
db.createUser({
  user: 'ecomuser',
  pwd: 'ecompass123',
  roles: [
    {
      role: 'readWrite',
      db: 'newecom'
    }
  ]
});

// Create initial collections and indexes
db.createCollection('users');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('settings');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.products.createIndex({ name: 1 });
db.orders.createIndex({ createdAt: -1 });

print('Database initialized successfully');
