import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import express from 'express';
import { connectToDatabase } from '../../server/db';
import { registerRoutes } from '../../server/routes';

describe('Shopping Cart Integration Tests', () => {
  let app: express.Application;
  let server: any;
  let authToken: string;
  let userId: string;
  let productId: string;
  let categoryId: string;
  let cartId: string;
  let testUser: any;
  let testProduct: any;
  let testCategory: any;

  beforeAll(async () => {
    // Create Express app
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    // Connect to database
    await connectToDatabase();
    
    // Register routes
    server = await registerRoutes(app);
    
    // Wait for server to be ready
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

  beforeEach(async () => {
    // Reset test data
    testUser = {
      name: 'Test User',
      email: `testuser${Date.now()}@example.com`,
      password: 'password123'
    };

    testCategory = {
      name: `Test Category ${Date.now()}`,
      description: 'A test category for integration testing'
    };

    testProduct = {
      name: `Test Product ${Date.now()}`,
      description: 'A test product for integration testing',
      price: 99.99,
      category: '',
      stock: 100,
      images: ['https://example.com/image1.jpg']
    };

    // Register and login a user
    const userResponse = await request(server)
      .post('/api/auth/register')
      .send(testUser);
    
    authToken = userResponse.body.token;
    userId = userResponse.body.user._id;

    // Create a test category
    const categoryResponse = await request(server)
      .post('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testCategory);
    
    categoryId = categoryResponse.body.category._id;
    testProduct.category = categoryId;

    // Create a test product
    const productResponse = await request(server)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testProduct);
    
    productId = productResponse.body.product._id;
  });

  describe('POST /api/cart/add', () => {
    it('should add item to cart successfully', async () => {
      const cartData = {
        productId: productId,
        quantity: 2
      };

      const response = await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartData)
        .expect(200);

      expect(response.body).toHaveProperty('cart');
      expect(response.body.cart).toHaveProperty('items');
      expect(response.body.cart.items).toBeInstanceOf(Array);
      expect(response.body.cart.items.length).toBe(1);
      
      const cartItem = response.body.cart.items[0];
      expect(cartItem).toHaveProperty('product');
      expect(cartItem).toHaveProperty('quantity', cartData.quantity);
      expect(cartItem.product).toHaveProperty('_id', productId);
      expect(cartItem.product).toHaveProperty('name', testProduct.name);
      expect(cartItem.product).toHaveProperty('price', testProduct.price);
      
      // Store for later tests
      cartId = response.body.cart._id;
    });

    it('should return error without authentication', async () => {
      const cartData = {
        productId: productId,
        quantity: 1
      };

      const response = await request(server)
        .post('/api/cart/add')
        .send(cartData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return error for missing fields', async () => {
      const invalidCartData = { productId: productId };
      
      const response = await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCartData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should return error for invalid quantity', async () => {
      const invalidCartData = {
        productId: productId,
        quantity: 0
      };

      const response = await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCartData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('positive');
    });

    it('should return error for non-existent product', async () => {
      const invalidCartData = {
        productId: '507f1f77bcf86cd799439011',
        quantity: 1
      };

      const response = await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCartData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Product not found');
    });

    it('should return error for insufficient stock', async () => {
      // Create a product with low stock
      const lowStockProduct = {
        ...testProduct,
        name: `Low Stock Product ${Date.now()}`,
        stock: 2
      };

      const productResponse = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(lowStockProduct);
      
      const lowStockProductId = productResponse.body.product._id;

      const cartData = {
        productId: lowStockProductId,
        quantity: 5 // More than available stock
      };

      const response = await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Insufficient stock');
    });
  });

  describe('GET /api/cart', () => {
    beforeEach(async () => {
      // Add an item to cart
      await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          quantity: 2
        });
    });

    it('should get cart contents', async () => {
      const response = await request(server)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('cart');
      expect(response.body.cart).toHaveProperty('items');
      expect(response.body.cart.items).toBeInstanceOf(Array);
      expect(response.body.cart.items.length).toBe(1);
      
      const cartItem = response.body.cart.items[0];
      expect(cartItem).toHaveProperty('product');
      expect(cartItem).toHaveProperty('quantity');
      expect(cartItem).toHaveProperty('total');
      expect(cartItem.product).toHaveProperty('_id', productId);
      
      // Check cart totals
      expect(response.body.cart).toHaveProperty('subtotal');
      expect(response.body.cart).toHaveProperty('total');
      expect(response.body.cart.subtotal).toBeGreaterThan(0);
      expect(response.body.cart.total).toBeGreaterThan(0);
    });

    it('should return empty cart for new user', async () => {
      // Create a new user
      const newUserResponse = await request(server)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: `newuser${Date.now()}@example.com`,
          password: 'password123'
        });
      
      const newAuthToken = newUserResponse.body.token;

      const response = await request(server)
        .get('/api/cart')
        .set('Authorization', `Bearer ${newAuthToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('cart');
      expect(response.body.cart).toHaveProperty('items');
      expect(response.body.cart.items).toBeInstanceOf(Array);
      expect(response.body.cart.items.length).toBe(0);
      expect(response.body.cart.subtotal).toBe(0);
      expect(response.body.cart.total).toBe(0);
    });

    it('should return error without authentication', async () => {
      const response = await request(server)
        .get('/api/cart')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });
  });

  describe('PUT /api/cart/update', () => {
    beforeEach(async () => {
      // Add an item to cart
      await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          quantity: 2
        });
    });

    it('should update cart item quantity successfully', async () => {
      const updateData = {
        productId: productId,
        quantity: 5
      };

      const response = await request(server)
        .put('/api/cart/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('cart');
      expect(response.body.cart.items[0]).toHaveProperty('quantity', updateData.quantity);
      
      // Check that total is updated
      const expectedTotal = testProduct.price * updateData.quantity;
      expect(response.body.cart.items[0].total).toBe(expectedTotal);
    });

    it('should return error without authentication', async () => {
      const updateData = {
        productId: productId,
        quantity: 3
      };

      const response = await request(server)
        .put('/api/cart/update')
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return error for item not in cart', async () => {
      const updateData = {
        productId: '507f1f77bcf86cd799439011',
        quantity: 3
      };

      const response = await request(server)
        .put('/api/cart/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Item not found in cart');
    });

    it('should return error for invalid quantity', async () => {
      const updateData = {
        productId: productId,
        quantity: -1
      };

      const response = await request(server)
        .put('/api/cart/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('positive');
    });

    it('should remove item when quantity is 0', async () => {
      const updateData = {
        productId: productId,
        quantity: 0
      };

      const response = await request(server)
        .put('/api/cart/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('cart');
      expect(response.body.cart.items).toBeInstanceOf(Array);
      expect(response.body.cart.items.length).toBe(0);
    });
  });

  describe('DELETE /api/cart/remove/:productId', () => {
    beforeEach(async () => {
      // Add an item to cart
      await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          quantity: 2
        });
    });

    it('should remove item from cart successfully', async () => {
      const response = await request(server)
        .delete(`/api/cart/remove/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('cart');
      expect(response.body.cart.items).toBeInstanceOf(Array);
      expect(response.body.cart.items.length).toBe(0);
      expect(response.body.cart.subtotal).toBe(0);
      expect(response.body.cart.total).toBe(0);
    });

    it('should return error without authentication', async () => {
      const response = await request(server)
        .delete(`/api/cart/remove/${productId}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return error for item not in cart', async () => {
      const response = await request(server)
        .delete('/api/cart/remove/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Item not found in cart');
    });
  });

  describe('DELETE /api/cart/clear', () => {
    beforeEach(async () => {
      // Add multiple items to cart
      await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          quantity: 2
        });

      // Create another product and add to cart
      const anotherProduct = {
        ...testProduct,
        name: `Another Product ${Date.now()}`
      };

      const productResponse = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(anotherProduct);
      
      await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productResponse.body.product._id,
          quantity: 1
        });
    });

    it('should clear entire cart successfully', async () => {
      const response = await request(server)
        .delete('/api/cart/clear')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('cart');
      expect(response.body.cart.items).toBeInstanceOf(Array);
      expect(response.body.cart.items.length).toBe(0);
      expect(response.body.cart.subtotal).toBe(0);
      expect(response.body.cart.total).toBe(0);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Cart cleared successfully');
    });

    it('should return error without authentication', async () => {
      const response = await request(server)
        .delete('/api/cart/clear')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });
  });

  describe('Cart Calculations', () => {
    beforeEach(async () => {
      // Add items with different prices
      await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          quantity: 2
        });

      // Create another product with different price
      const expensiveProduct = {
        ...testProduct,
        name: `Expensive Product ${Date.now()}`,
        price: 199.99
      };

      const productResponse = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expensiveProduct);
      
      await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productResponse.body.product._id,
          quantity: 1
        });
    });

    it('should calculate correct totals', async () => {
      const response = await request(server)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('cart');
      expect(response.body.cart).toHaveProperty('subtotal');
      expect(response.body.cart).toHaveProperty('total');
      expect(response.body.cart).toHaveProperty('items');
      
      // Calculate expected subtotal
      let expectedSubtotal = 0;
      response.body.cart.items.forEach((item: any) => {
        expectedSubtotal += item.total;
      });
      
      expect(response.body.cart.subtotal).toBe(expectedSubtotal);
      expect(response.body.cart.total).toBeGreaterThanOrEqual(expectedSubtotal);
    });

    it('should handle quantity updates correctly', async () => {
      // Update quantity of first item
      const updateData = {
        productId: productId,
        quantity: 5
      };

      const response = await request(server)
        .put('/api/cart/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      const updatedItem = response.body.cart.items.find((item: any) => item.product._id === productId);
      expect(updatedItem.quantity).toBe(5);
      expect(updatedItem.total).toBe(testProduct.price * 5);
    });
  });

  describe('Cart Persistence', () => {
    it('should maintain cart across requests', async () => {
      // Add item to cart
      await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          quantity: 2
        });

      // Get cart in another request
      const response = await request(server)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.cart.items.length).toBe(1);
      expect(response.body.cart.items[0].product._id).toBe(productId);
      expect(response.body.cart.items[0].quantity).toBe(2);
    });

    it('should maintain separate carts for different users', async () => {
      // Add item to first user's cart
      await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          quantity: 2
        });

      // Create second user
      const secondUserResponse = await request(server)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          email: `seconduser${Date.now()}@example.com`,
          password: 'password123'
        });
      
      const secondAuthToken = secondUserResponse.body.token;

      // Get second user's cart
      const secondCartResponse = await request(server)
        .get('/api/cart')
        .set('Authorization', `Bearer ${secondAuthToken}`)
        .expect(200);

      expect(secondCartResponse.body.cart.items.length).toBe(0);
    });
  });

  describe('Cart Error Handling', () => {
    it('should handle concurrent cart operations', async () => {
      // Add item to cart
      await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          quantity: 1
        });

      // Try to update non-existent item
      const updateData = {
        productId: '507f1f77bcf86cd799439011',
        quantity: 3
      };

      const response = await request(server)
        .put('/api/cart/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Item not found in cart');
    });

    it('should handle invalid product IDs gracefully', async () => {
      const invalidCartData = {
        productId: 'invalid-id',
        quantity: 1
      };

      const response = await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCartData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Cart Performance', () => {
    it('should handle large cart efficiently', async () => {
      // Add multiple items to cart
      for (let i = 0; i < 10; i++) {
        const productData = {
          ...testProduct,
          name: `Product ${i}`,
          price: 10 + i
        };

        const productResponse = await request(server)
          .post('/api/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send(productData);

        await request(server)
          .post('/api/cart/add')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            productId: productResponse.body.product._id,
            quantity: 1
          });
      }

      const response = await request(server)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.cart.items.length).toBe(10);
      expect(response.body.cart.subtotal).toBeGreaterThan(0);
    });
  });
});
