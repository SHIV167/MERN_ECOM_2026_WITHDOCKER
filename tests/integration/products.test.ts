import request from 'supertest';
import express from 'express';
import { connectToDatabase } from '../../server/db';
import { registerRoutes } from '../../server/routes';

describe('Product Management Integration Tests', () => {
  let app: express.Application;
  let userToken: string;
  let testCategory: any;
  let testProduct: any;

  beforeAll(async () => {
    app = express();
    await connectToDatabase();
    registerRoutes(app);

    // Create a test user and get token
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'producttest@example.com',
        password: 'password123',
        name: 'Product Tester'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'producttest@example.com',
        password: 'password123'
      });

    userToken = loginResponse.body.token;

    // Create a test category
    const categoryResponse = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category description'
      });

    testCategory = categoryResponse.body.category;
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test product description',
        price: 99.99,
        category: testCategory._id,
        stock: 10,
        images: ['https://example.com/image.jpg']
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('name', productData.name);
      expect(response.body.product).toHaveProperty('price', productData.price);
      expect(response.body.product).toHaveProperty('category', testCategory._id);

      testProduct = response.body.product;
    });

    it('should return 400 for missing required fields', async () => {
      const productData = {
        name: 'Incomplete Product'
        // Missing other required fields
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for unauthenticated requests', async () => {
      const productData = {
        name: 'Unauthorized Product',
        slug: 'unauthorized-product',
        description: 'Test description',
        price: 99.99,
        category: testCategory._id
      };

      await request(app)
        .post('/api/products')
        .send(productData)
        .expect(401);
    });
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.length).toBeGreaterThan(0);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get(`/api/products?category=${testCategory._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body.products.length).toBeGreaterThan(0);
      response.body.products.forEach((product: any) => {
        expect(product.category).toBe(testCategory._id);
      });
    });

    it('should paginate products', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 5);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get a single product by ID', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('_id', testProduct._id);
      expect(response.body.product).toHaveProperty('name', testProduct.name);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product', async () => {
      const updateData = {
        name: 'Updated Product Name',
        price: 149.99
      };

      const response = await request(app)
        .put(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('name', updateData.name);
      expect(response.body.product).toHaveProperty('price', updateData.price);
    });

    it('should return 401 for unauthenticated update', async () => {
      const updateData = {
        name: 'Hacker Update'
      };

      await request(app)
        .put(`/api/products/${testProduct._id}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      await request(app)
        .delete(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verify product is deleted
      await request(app)
        .get(`/api/products/${testProduct._id}`)
        .expect(404);
    });

    it('should return 401 for unauthenticated delete', async () => {
      await request(app)
        .delete(`/api/products/${testProduct._id}`)
        .expect(401);
    });
  });
});
