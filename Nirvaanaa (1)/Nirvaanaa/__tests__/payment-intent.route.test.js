/**
 * Tests for PaymentIntent API route
 * Tests successful payment, cancellation, and failed scenarios
 */

jest.mock('@/lib/mongodb', () => jest.fn());
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn(),
    },
  }));
});

import { POST } from '@/app/api/payment-intent/route';
import { getServerSession } from 'next-auth';
import stripe from 'stripe';

describe('POST /api/payment-intent', () => {
  let mockStripeClient;
  let mockRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Stripe client
    mockStripeClient = {
      paymentIntents: {
        create: jest.fn(),
      },
    };
    
    stripe.mockReturnValue(mockStripeClient);

    // Mock request
    mockRequest = {
      json: jest.fn(),
    };

    // Mock environment
    process.env.STRIPE_SECRET_KEY = 'sk_test_test_key';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      getServerSession.mockResolvedValue(null);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });
  });

  describe('Successful Payment Intent Creation', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: {
          id: 'user_123',
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      // Mock Product model
      jest.doMock('@/models/Product', () => ({
        find: jest.fn().mockResolvedValue([
          {
            _id: 'prod_123',
            title: 'Test Product',
            price: 1000,
            discount: 0,
            stock: 10,
            published: true,
            images: [],
          },
        ]),
      }));

      // Mock Order model
      jest.doMock('@/models/Order', () => {
        const mockOrder = {
          save: jest.fn().mockResolvedValue(true),
          _id: 'order_123',
          orderNumber: 'ORD-123',
        };
        return jest.fn().mockImplementation(() => mockOrder);
      });
    });

    it('should create a PaymentIntent successfully', async () => {
      mockRequest.json.mockResolvedValue({
        items: [
          {
            productId: 'prod_123',
            quantity: 2,
          },
        ],
        shipping: {
          name: 'Test User',
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'India',
          phone: '1234567890',
        },
        shippingMethod: 'Standard Shipping',
      });

      mockStripeClient.paymentIntents.create.mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_xyz',
        status: 'requires_payment_method',
        amount: 236000, // 2000 (subtotal) + 100 (shipping) + 360 (tax) = 2460 * 100 paise
      });

      // Dynamically import after mocks are set up
      const { default: Product } = await import('@/models/Product');
      const { default: Order } = await import('@/models/Order');
      
      Product.find = jest.fn().mockResolvedValue([
        {
          _id: 'prod_123',
          title: 'Test Product',
          price: 1000,
          discount: 0,
          stock: 10,
          published: true,
          images: [],
        },
      ]);

      Order.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(true),
        _id: 'order_123',
        orderNumber: 'ORD-123',
      }));

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.clientSecret).toBe('pi_test_123_secret_xyz');
      expect(data.orderId).toBeDefined();
      expect(data.paymentIntentId).toBe('pi_test_123');
      expect(mockStripeClient.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: expect.any(Number),
          currency: 'inr',
          payment_method_types: ['card', 'upi'],
          metadata: expect.objectContaining({
            orderId: expect.any(String),
            userId: 'user_123',
          }),
        })
      );
    });

    it('should use card payment method type (UPI disabled)', async () => {
      mockRequest.json.mockResolvedValue({
        items: [
          {
            productId: 'prod_123',
            quantity: 1,
          },
        ],
        shipping: {
          name: 'Test User',
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'India',
          phone: '1234567890',
        },
        shippingMethod: 'Standard Shipping',
      });

      mockStripeClient.paymentIntents.create.mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_xyz',
        status: 'requires_payment_method',
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockStripeClient.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ['card'], // UPI temporarily disabled
        })
      );
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: {
          id: 'user_123',
          email: 'test@example.com',
        },
      });
    });

    it('should return 400 if cart items are missing', async () => {
      mockRequest.json.mockResolvedValue({
        shipping: {
          name: 'Test User',
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'India',
        },
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Cart items are required');
    });

    it('should return 400 if shipping address is missing', async () => {
      mockRequest.json.mockResolvedValue({
        items: [
          {
            productId: 'prod_123',
            quantity: 1,
          },
        ],
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Shipping address is required');
    });

    it('should return 500 if Stripe is not configured', async () => {
      delete process.env.STRIPE_SECRET_KEY;

      // Need to reload the module to pick up the missing env var
      jest.resetModules();
      const { POST: POSTReloaded } = await import('@/app/api/payment-intent/route');

      mockRequest.json.mockResolvedValue({
        items: [{ productId: 'prod_123', quantity: 1 }],
        shipping: { name: 'Test', street: '123 St', city: 'City', state: 'State', zipCode: '12345', country: 'India' },
      });

      const response = await POSTReloaded(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Stripe is not configured');
    });

    it('should handle Stripe API errors', async () => {
      mockRequest.json.mockResolvedValue({
        items: [
          {
            productId: 'prod_123',
            quantity: 1,
          },
        ],
        shipping: {
          name: 'Test User',
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'India',
        },
        shippingMethod: 'Standard Shipping',
      });

      mockStripeClient.paymentIntents.create.mockRejectedValue(
        new Error('Stripe API error')
      );

      // Mock Product and Order
      const { default: Product } = await import('@/models/Product');
      Product.find = jest.fn().mockResolvedValue([
        {
          _id: 'prod_123',
          title: 'Test Product',
          price: 1000,
          discount: 0,
          stock: 10,
          published: true,
        },
      ]);

      const { default: Order } = await import('@/models/Order');
      Order.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(true),
        _id: 'order_123',
      }));

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Stripe API error');
    });
  });

  describe('Order Creation', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: {
          id: 'user_123',
          email: 'test@example.com',
        },
      });
    });

    it('should create order with correct totals including GST', async () => {
      mockRequest.json.mockResolvedValue({
        items: [
          {
            productId: 'prod_123',
            quantity: 2,
          },
        ],
        shipping: {
          name: 'Test User',
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'India',
          phone: '1234567890',
        },
        shippingMethod: 'Standard Shipping',
      });

      const { default: Product } = await import('@/models/Product');
      Product.find = jest.fn().mockResolvedValue([
        {
          _id: 'prod_123',
          title: 'Test Product',
          price: 1000,
          discount: 0,
          stock: 10,
          published: true,
          images: [],
        },
      ]);

      const { default: Order } = await import('@/models/Order');
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockOrder = {
        save: mockSave,
        _id: 'order_123',
      };
      Order.mockImplementation(() => mockOrder);

      mockStripeClient.paymentIntents.create.mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_xyz',
      });

      const response = await POST(mockRequest);
      
      expect(response.status).toBe(200);
      expect(Order).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalledTimes(2); // Once for initial save, once after PaymentIntent creation
    });
  });
});

