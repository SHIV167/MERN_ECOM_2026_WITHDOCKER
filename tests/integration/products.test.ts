import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import express from 'express';
import { connectToDatabase } from '../../server/db';
import { registerRoutes } from '../../server/routes';

describe('Products Integration Tests', () => {
  let app: express.Application;
  let server: any;
  let authToken: string;
  let userId: string;
  let productId: string;
  let categoryId: string;
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
  });

  describe('POST /api/categories', () => {
    it('should create a new category successfully', async () => {
      const response = await request(server)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCategory)
        .expect(201);

      expect(response.body).toHaveProperty('category');
      expect(response.body.category).toHaveProperty('_id');
      expect(response.body.category).toHaveProperty('name', testCategory.name);
      expect(response.body.category).toHaveProperty('description', testCategory.description);
      expect(response.body.category).toHaveProperty('slug');
      
      // Store for later tests
      categoryId = response.body.category._id;
      testProduct.category = categoryId;
    });

    it('should return error without authentication', async () => {
      const response = await request(server)
        .post('/api/categories')
        .send(testCategory)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return validation error for missing fields', async () => {
      const invalidCategory = { description: 'Missing name' };
      
      const response = await request(server)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCategory)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should return error for duplicate category name', async () => {
      // First category creation
      await request(server)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCategory)
        .expect(201);

      // Second category with same name
      const response = await request(server)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCategory)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('GET /api/categories', () => {
    beforeEach(async () => {
      // Create a test category
      const response = await request(server)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCategory);
      
      categoryId = response.body.category._id;
      testProduct.category = categoryId;
    });

    it('should get all categories', async () => {
      const response = await request(server)
        .get('/api/categories')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      
      const category = response.body.find((cat: any) => cat._id === categoryId);
      expect(category).toBeDefined();
      expect(category.name).toBe(testCategory.name);
      expect(category.description).toBe(testCategory.description);
    });

    it('should return empty array when no categories exist', async () => {
      // Clear categories (assuming there's a way to clear test data)
      const response = await request(server)
        .get('/api/categories')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      // Should handle empty state gracefully
    });
  });

  describe('POST /api/products', () => {
    beforeEach(async () => {
      // Create a test category first
      const response = await request(server)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCategory);
      
      categoryId = response.body.category._id;
      testProduct.category = categoryId;
    });

    it('should create a new product successfully', async () => {
      const response = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testProduct)
        .expect(201);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('_id');
      expect(response.body.product).toHaveProperty('name', testProduct.name);
      expect(response.body.product).toHaveProperty('description', testProduct.description);
      expect(response.body.product).toHaveProperty('price', testProduct.price);
      expect(response.body.product).toHaveProperty('category', categoryId);
      expect(response.body.product).toHaveProperty('stock', testProduct.stock);
      expect(response.body.product).toHaveProperty('images');
      
      // Store for later tests
      productId = response.body.product._id;
    });

    it('should return error without authentication', async () => {
      const response = await request(server)
        .post('/api/products')
        .send(testProduct)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return validation error for missing fields', async () => {
      const invalidProduct = { name: 'Missing required fields' };
      
      const response = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProduct)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should return error for invalid price', async () => {
      const invalidProduct = {
        ...testProduct,
        price: -10
      };

      const response = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProduct)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('positive');
    });

    it('should return error for invalid stock', async () => {
      const invalidProduct = {
        ...testProduct,
        stock: -5
      };

      const response = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProduct)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('positive');
    });

    it('should return error for non-existent category', async () => {
      const invalidProduct = {
        ...testProduct,
        category: '507f1f77bcf86cd799439011'
      };

      const response = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProduct)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Category not found');
    });
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create a test category and product
      const categoryResponse = await request(server)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCategory);
      
      categoryId = categoryResponse.body.category._id;
      testProduct.category = categoryId;

      const productResponse = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testProduct);
      
      productId = productResponse.body.product._id;
    });

    it('should get all products', async () => {
      const response = await request(server)
        .get('/api/products')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      
      const product = response.body.find((p: any) => p._id === productId);
      expect(product).toBeDefined();
      expect(product.name).toBe(testProduct.name);
      expect(product.price).toBe(testProduct.price);
    });

    it('should paginate products', async () => {
      const response = await request(server)
        .get('/api/products?page=1&limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.products).toBeInstanceOf(Array);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should filter products by category', async () => {
      const response = await request(server)
        .get(`/api/products?category=${categoryId}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      response.body.forEach((product: any) => {
        expect(product.category).toBe(categoryId);
      });
    });

    it('should search products by name', async () => {
      const response = await request(server)
        .get(`/api/products?search=${testProduct.name.substring(0, 5)}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      response.body.forEach((product: any) => {
        expect(product.name.toLowerCase()).toContain(testProduct.name.substring(0, 5).toLowerCase());
      });
    });

    it('should filter products by price range', async () => {
      const response = await request(server)
        .get(`/api/products?minPrice=50&maxPrice=150`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      response.body.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(50);
        expect(product.price).toBeLessThanOrEqual(150);
      });
    });

    it('should sort products by price', async () => {
      const response = await request(server)
        .get('/api/products?sort=price')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      
      for (let i = 1; i < response.body.length; i++) {
        expect(response.body[i].price).toBeGreaterThanOrEqual(response.body[i - 1].price);
      }
    });

    it('should sort products by price descending', async () => {
      const response = await request(server)
        .get('/api/products?sort=-price')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      
      for (let i = 1; i < response.body.length; i++) {
        expect(response.body[i].price).toBeLessThanOrEqual(response.body[i - 1].price);
      }
    });
  });

  describe('GET /api/products/:id', () => {
    beforeEach(async () => {
      // Create a test category and product
      const categoryResponse = await request(server)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCategory);
      
      categoryId = categoryResponse.body.category._id;
      testProduct.category = categoryId;

      const productResponse = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testProduct);
      
      productId = productResponse.body.product._id;
    });

    it('should get product by ID', async () => {
      const response = await request(server)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('_id', productId);
      expect(response.body.product).toHaveProperty('name', testProduct.name);
      expect(response.body.product).toHaveProperty('description', testProduct.description);
      expect(response.body.product).toHaveProperty('price', testProduct.price);
      expect(response.body.product).toHaveProperty('category');
      expect(response.body.product.category).toHaveProperty('_id', categoryId);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(server)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });
  });

  describe('PUT /api/products/:id', () => {
    beforeEach(async () => {
      // Create a test category and product
      const categoryResponse = await request(server)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCategory);
      
      categoryId = categoryResponse.body.category._id;
      testProduct.category = categoryId;

      const productResponse = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testProduct);
      
      productId = productResponse.body.product._id;
    });

    it('should update product successfully', async () => {
      const updateData = {
        name: 'Updated Product Name',
        price: 149.99,
        description: 'Updated description'
      };

      const response = await request(server)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('_id', productId);
      expect(response.body.product).toHaveProperty('name', updateData.name);
      expect(response.body.product).toHaveProperty('price', updateData.price);
      expect(response.body.product).toHaveProperty('description', updateData.description);
    });

    it('should return error without authentication', async () => {
      const updateData = { name: 'Updated Name' };

      const response = await request(server)
        .put(`/api/products/${productId}`)
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return error for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { name: 'Updated Name' };

      const response = await request(server)
        .put(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should return error for invalid update data', async () => {
      const updateData = { price: -10 };

      const response = await request(server)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('positive');
    });
  });

  describe('DELETE /api/products/:id', () => {
    beforeEach(async () => {
      // Create a test category and product
      const categoryResponse = await request(server)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCategory);
      
      categoryId = categoryResponse.body.category._id;
      testProduct.category = categoryId;

      const productResponse = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testProduct);
      
      productId = productResponse.body.product._id;
    });

    it('should delete product successfully', async () => {
      const response = await request(server)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted successfully');

      // Verify product is deleted
      await request(server)
        .get(`/api/products/${productId}`)
        .expect(404);
    });

    it('should return error without authentication', async () => {
      const response = await request(server)
        .delete(`/api/products/${productId}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return error for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(server)
        .delete(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });
  });

  describe('Product Reviews', () => {
    beforeEach(async () => {
      // Create a test category and product
      const categoryResponse = await request(server)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCategory);
      
      categoryId = categoryResponse.body.category._id;
      testProduct.category = categoryId;

      const productResponse = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testProduct);
      
      productId = productResponse.body.product._id;
    });

    it('should add a product review', async () => {
      const reviewData = {
        rating: 5,
        title: 'Great Product!',
        comment: 'This is an excellent product.'
      };

      const response = await request(server)
        .post(`/api/products/${productId}/reviews`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(201);

      expect(response.body).toHaveProperty('review');
      expect(response.body.review).toHaveProperty('rating', reviewData.rating);
      expect(response.body.review).toHaveProperty('title', reviewData.title);
      expect(response.body.review).toHaveProperty('comment', reviewData.comment);
      expect(response.body.review).toHaveProperty('user');
      expect(response.body.review.user).toHaveProperty('_id', userId);
    });

    it('should get product reviews', async () => {
      // First add a review
      const reviewData = {
        rating: 4,
        title: 'Good Product',
        comment: 'Pretty good product.'
      };

      await request(server)
        .post(`/api/products/${productId}/reviews`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(201);

      // Get reviews
      const response = await request(server)
        .get(`/api/products/${productId}/reviews`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      
      const review = response.body[0];
      expect(review).toHaveProperty('rating');
      expect(review).toHaveProperty('title');
      expect(review).toHaveProperty('comment');
      expect(review).toHaveProperty('user');
    });

    it('should validate review data', async () => {
      const invalidReview = {
        rating: 6, // Invalid rating
        title: 'Bad Review'
      };

      const response = await request(server)
        .post(`/api/products/${productId}/reviews`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidReview)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('rating');
    });
  });

  describe('Product Search and Filtering', () => {
    beforeEach(async () => {
      // Create multiple test products
      const categoryResponse = await request(server)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCategory);
      
      categoryId = categoryResponse.body.category._id;

      for (let i = 0; i < 5; i++) {
        await request(server)
          .post('/api/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            ...testProduct,
            name: `Test Product ${i}`,
            price: 50 + i * 20,
            category: categoryId
          });
      }
    });

    it('should search products with multiple terms', async () => {
      const response = await request(server)
        .get('/api/products?search=Test Product')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      
      response.body.forEach((product: any) => {
        expect(product.name.toLowerCase()).toContain('test product');
      });
    });

    it('should combine multiple filters', async () => {
      const response = await request(server)
        .get(`/api/products?category=${categoryId}&minPrice=60&maxPrice=100`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      response.body.forEach((product: any) => {
        expect(product.category).toBe(categoryId);
        expect(product.price).toBeGreaterThanOrEqual(60);
        expect(product.price).toBeLessThanOrEqual(100);
      });
    });

    it('should handle empty search results', async () => {
      const response = await request(server)
        .get('/api/products?search=NonExistentProduct')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });
  });
});
