import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import express from 'express';
import { connectToDatabase } from '../../server/db';
import { registerRoutes } from '../../server/routes';

describe('Orders Integration Tests', () => {
  let app: express.Application;
  let server: any;
  let authToken: string;
  let userId: string;
  let productId: string;
  let categoryId: string;
  let orderId: string;
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

  describe('POST /api/orders', () => {
    beforeEach(async () => {
      // Add item to cart
      await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          quantity: 2
        });
    });

    it('should create order successfully', async () => {
      const orderData = {
        items: [
          {
            product: productId,
            quantity: 2,
            price: testProduct.price
          }
        ],
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card'
      };

      const response = await request(server)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('order');
      expect(response.body.order).toHaveProperty('_id');
      expect(response.body.order).toHaveProperty('user');
      expect(response.body.order.user).toHaveProperty('_id', userId);
      expect(response.body.order).toHaveProperty('items');
      expect(response.body.order.items).toBeInstanceOf(Array);
      expect(response.body.order.items.length).toBe(1);
      expect(response.body.order).toHaveProperty('total');
      expect(response.body.order).toHaveProperty('status', 'pending');
      expect(response.body.order).toHaveProperty('shippingAddress');
      expect(response.body.order).toHaveProperty('paymentMethod', orderData.paymentMethod);
      
      // Store for later tests
      orderId = response.body.order._id;

      // Verify order details
      const orderItem = response.body.order.items[0];
      expect(orderItem.product).toHaveProperty('_id', productId);
      expect(orderItem.quantity).toBe(2);
      expect(orderItem.price).toBe(testProduct.price);
      
      // Verify shipping address
      const shipping = response.body.order.shippingAddress;
      expect(shipping.street).toBe(orderData.shippingAddress.street);
      expect(shipping.city).toBe(orderData.shippingAddress.city);
      expect(shipping.state).toBe(orderData.shippingAddress.state);
      expect(shipping.zipCode).toBe(orderData.shippingAddress.zipCode);
      expect(shipping.country).toBe(orderData.shippingAddress.country);
    });

    it('should return error without authentication', async () => {
      const orderData = {
        items: [{ product: productId, quantity: 1, price: testProduct.price }],
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card'
      };

      const response = await request(server)
        .post('/api/orders')
        .send(orderData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return validation error for missing fields', async () => {
      const invalidOrderData = {
        items: [{ product: productId, quantity: 1, price: testProduct.price }]
        // Missing shippingAddress and paymentMethod
      };

      const response = await request(server)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidOrderData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should return error for empty items array', async () => {
      const invalidOrderData = {
        items: [],
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card'
      };

      const response = await request(server)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidOrderData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('at least one item');
    });

    it('should return error for invalid payment method', async () => {
      const invalidOrderData = {
        items: [{ product: productId, quantity: 1, price: testProduct.price }],
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'invalid_method'
      };

      const response = await request(server)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidOrderData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid payment method');
    });

    it('should calculate correct order total', async () => {
      const orderData = {
        items: [
          {
            product: productId,
            quantity: 3,
            price: testProduct.price
          }
        ],
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card'
      };

      const response = await request(server)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      const expectedTotal = testProduct.price * 3;
      expect(response.body.order.total).toBe(expectedTotal);
    });
  });

  describe('GET /api/orders', () => {
    beforeEach(async () => {
      // Create an order
      await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          quantity: 2
        });

      const orderData = {
        items: [
          {
            product: productId,
            quantity: 2,
            price: testProduct.price
          }
        ],
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card'
      };

      const orderResponse = await request(server)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);
      
      orderId = orderResponse.body.order._id;
    });

    it('should get user orders', async () => {
      const response = await request(server)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      
      const order = response.body.find((o: any) => o._id === orderId);
      expect(order).toBeDefined();
      expect(order).toHaveProperty('_id', orderId);
      expect(order).toHaveProperty('user');
      expect(order.user).toHaveProperty('_id', userId);
      expect(order).toHaveProperty('items');
      expect(order).toHaveProperty('total');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('createdAt');
    });

    it('should return empty array for user with no orders', async () => {
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
        .get('/api/orders')
        .set('Authorization', `Bearer ${newAuthToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });

    it('should return error without authentication', async () => {
      const response = await request(server)
        .get('/api/orders')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });
  });

  describe('GET /api/orders/:id', () => {
    beforeEach(async () => {
      // Create an order
      await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          quantity: 2
        });

      const orderData = {
        items: [
          {
            product: productId,
            quantity: 2,
            price: testProduct.price
          }
        ],
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card'
      };

      const orderResponse = await request(server)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);
      
      orderId = orderResponse.body.order._id;
    });

    it('should get order by ID', async () => {
      const response = await request(server)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('order');
      expect(response.body.order).toHaveProperty('_id', orderId);
      expect(response.body.order).toHaveProperty('user');
      expect(response.body.order.user).toHaveProperty('_id', userId);
      expect(response.body.order).toHaveProperty('items');
      expect(response.body.order).toHaveProperty('total');
      expect(response.body.order).toHaveProperty('status');
      expect(response.body.order).toHaveProperty('shippingAddress');
      expect(response.body.order).toHaveProperty('paymentMethod');
      expect(response.body.order).toHaveProperty('createdAt');
      expect(response.body.order).toHaveProperty('updatedAt');
    });

    it('should return error for non-existent order', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(server)
        .get(`/api/orders/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Order not found');
    });

    it('should return error without authentication', async () => {
      const response = await request(server)
        .get(`/api/orders/${orderId}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return error for order belonging to different user', async () => {
      // Create another user
      const secondUserResponse = await request(server)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          email: `seconduser${Date.now()}@example.com`,
          password: 'password123'
        });
      
      const secondAuthToken = secondUserResponse.body.token;

      const response = await request(server)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${secondAuthToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Access denied');
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    beforeEach(async () => {
      // Create an order
      await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          quantity: 2
        });

      const orderData = {
        items: [
          {
            product: productId,
            quantity: 2,
            price: testProduct.price
          }
        ],
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card'
      };

      const orderResponse = await request(server)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);
      
      orderId = orderResponse.body.order._id;
    });

    it('should update order status successfully', async () => {
      const updateData = {
        status: 'processing'
      };

      const response = await request(server)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('order');
      expect(response.body.order).toHaveProperty('_id', orderId);
      expect(response.body.order).toHaveProperty('status', updateData.status);
      expect(response.body.order).toHaveProperty('updatedAt');
    });

    it('should return error for invalid status', async () => {
      const updateData = {
        status: 'invalid_status'
      };

      const response = await request(server)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid status');
    });

    it('should return error without authentication', async () => {
      const updateData = {
        status: 'processing'
      };

      const response = await request(server)
        .put(`/api/orders/${orderId}/status`)
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return error for non-existent order', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = {
        status: 'processing'
      };

      const response = await request(server)
        .put(`/api/orders/${fakeId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Order not found');
    });
  });

  describe('DELETE /api/orders/:id', () => {
    beforeEach(async () => {
      // Create an order
      await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          quantity: 2
        });

      const orderData = {
        items: [
          {
            product: productId,
            quantity: 2,
            price: testProduct.price
          }
        ],
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card'
      };

      const orderResponse = await request(server)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);
      
      orderId = orderResponse.body.order._id;
    });

    it('should cancel order successfully', async () => {
      const response = await request(server)
        .delete(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('order');
      expect(response.body.order).toHaveProperty('_id', orderId);
      expect(response.body.order).toHaveProperty('status', 'cancelled');
      expect(response.body.order).toHaveProperty('message');
      expect(response.body.order.message).toContain('Order cancelled successfully');

      // Verify order is cancelled
      const getOrderResponse = await request(server)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getOrderResponse.body.order.status).toBe('cancelled');
    });

    it('should return error without authentication', async () => {
      const response = await request(server)
        .delete(`/api/orders/${orderId}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return error for non-existent order', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(server)
        .delete(`/api/orders/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Order not found');
    });

    it('should not allow cancelling completed orders', async () => {
      // First update order status to completed
      await request(server)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' });

      const response = await request(server)
        .delete(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Cannot cancel completed order');
    });
  });

  describe('Order Status Transitions', () => {
    beforeEach(async () => {
      // Create an order
      await request(server)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          quantity: 2
        });

      const orderData = {
        items: [
          {
            product: productId,
            quantity: 2,
            price: testProduct.price
          }
        ],
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card'
      };

      const orderResponse = await request(server)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);
      
      orderId = orderResponse.body.order._id;
    });

    it('should follow proper status flow', async () => {
      // Initial status should be pending
      const initialResponse = await request(server)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(initialResponse.body.order.status).toBe('pending');

      // Update to processing
      await request(server)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'processing' });

      const processingResponse = await request(server)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(processingResponse.body.order.status).toBe('processing');

      // Update to shipped
      await request(server)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'shipped' });

      const shippedResponse = await request(server)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(shippedResponse.body.order.status).toBe('shipped');

      // Update to delivered
      await request(server)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'delivered' });

      const deliveredResponse = await request(server)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deliveredResponse.body.order.status).toBe('delivered');
    });

    it('should prevent invalid status transitions', async () => {
      // Try to set status to completed without going through proper flow
      const response = await request(server)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid status transition');
    });
  });

  describe('Order Filtering and Sorting', () => {
    beforeEach(async () => {
      // Create multiple orders with different statuses
      const statuses = ['pending', 'processing', 'shipped', 'delivered'];
      
      for (let i = 0; i < statuses.length; i++) {
        // Add item to cart
        await request(server)
          .post('/api/cart/add')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            productId: productId,
            quantity: 1
          });

        // Create order
        const orderData = {
          items: [
            {
              product: productId,
              quantity: 1,
              price: testProduct.price
            }
          ],
          shippingAddress: {
            street: `${i} Test Street`,
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'Test Country'
          },
          paymentMethod: 'credit_card'
        };

        await request(server)
          .post('/api/orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send(orderData);

        // Update status
        await request(server)
          .put(`/api/orders/${i + 1}/status`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ status: statuses[i] });
      }
    });

    it('should filter orders by status', async () => {
      const response = await request(server)
        .get('/api/orders?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      response.body.forEach((order: any) => {
        expect(order.status).toBe('pending');
      });
    });

    it('should sort orders by date', async () => {
      const response = await request(server)
        .get('/api/orders?sort=createdAt')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      
      for (let i = 1; i < response.body.length; i++) {
        const currentDate = new Date(response.body[i].createdAt);
        const previousDate = new Date(response.body[i - 1].createdAt);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(previousDate.getTime());
      }
    });

    it('should sort orders by date descending', async () => {
      const response = await request(server)
        .get('/api/orders?sort=-createdAt')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      
      for (let i = 1; i < response.body.length; i++) {
        const currentDate = new Date(response.body[i].createdAt);
        const previousDate = new Date(response.body[i - 1].createdAt);
        expect(currentDate.getTime()).toBeLessThanOrEqual(previousDate.getTime());
      }
    });
  });

  describe('Order Performance', () => {
    it('should handle multiple orders efficiently', async () => {
      // Create multiple orders
      for (let i = 0; i < 5; i++) {
        await request(server)
          .post('/api/cart/add')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            productId: productId,
            quantity: 1
          });

        const orderData = {
          items: [
            {
              product: productId,
              quantity: 1,
              price: testProduct.price
            }
          ],
          shippingAddress: {
            street: `${i} Test Street`,
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'Test Country'
          },
          paymentMethod: 'credit_card'
        };

        await request(server)
          .post('/api/orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send(orderData)
          .expect(201);
      }

      const response = await request(server)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(5);
    });
  });
});
