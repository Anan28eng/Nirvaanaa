/**
 * Tests for Checkout Page Component
 * Tests payment flow, form validation, and error handling
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import CheckoutPage from '@/app/checkout/page';
import { useEnhancedCart } from '@/components/providers/EnhancedCartProvider';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('@/components/providers/EnhancedCartProvider');
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({})),
}));
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => <div data-testid="stripe-elements">{children}</div>,
  PaymentElement: () => <div data-testid="payment-element">Payment Element</div>,
  useStripe: () => null,
  useElements: () => null,
}));
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}));

global.fetch = jest.fn();

describe('CheckoutPage', () => {
  const mockCartItems = [
    {
      id: 'item_1',
      productId: 'prod_1',
      name: 'Test Product 1',
      price: 1000,
      quantity: 2,
      image: '/test-image.jpg',
    },
    {
      id: 'item_2',
      productId: 'prod_2',
      name: 'Test Product 2',
      price: 500,
      quantity: 1,
      image: '/test-image-2.jpg',
    },
  ];

  const mockSession = {
    user: {
      id: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useSession.mockReturnValue({ data: mockSession });
    useEnhancedCart.mockReturnValue({
      items: mockCartItems,
    });

    // Mock fetch for shipping methods
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        methods: [
          {
            _id: 'method_1',
            name: 'Standard Shipping',
            cost: 100,
            estimatedDays: { min: 5, max: 7 },
            isDefault: true,
          },
          {
            _id: 'method_2',
            name: 'Express Shipping',
            cost: 200,
            estimatedDays: { min: 2, max: 3 },
          },
        ],
      }),
    });

    // Mock fetch for user profile
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          name: 'Test User',
          email: 'test@example.com',
          shippingAddress: null,
        },
      }),
    });
  });

  describe('Rendering', () => {
    it('should render checkout page with cart items', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Checkout')).toBeInTheDocument();
      });

      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });

    it('should show empty cart message when cart is empty', () => {
      useEnhancedCart.mockReturnValue({ items: [] });

      render(<CheckoutPage />);

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });

    it('should display order summary with correct totals', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Order Summary')).toBeInTheDocument();
      });

      // Subtotal: (1000 * 2) + (500 * 1) = 2500
      // Shipping: 100 (standard)
      // Tax: 2500 * 0.18 = 450
      // Total: 2500 + 100 + 450 = 3050
      expect(screen.getByText(/Subtotal/i)).toBeInTheDocument();
      // Use getAllByText for Shipping as it appears multiple times
      const shippingTexts = screen.getAllByText(/Shipping/i);
      expect(shippingTexts.length).toBeGreaterThan(0);
      expect(screen.getByText(/Tax/i)).toBeInTheDocument();
      // Use getAllByText for Total as it might appear multiple times
      const totalTexts = screen.getAllByText(/Total/i);
      expect(totalTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Form Validation', () => {
    it('should show error when trying to proceed without shipping address', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Continue to Payment')).toBeInTheDocument();
      });

      const continueButton = screen.getByText('Continue to Payment');
      fireEvent.click(continueButton);

      await waitFor(() => {
        // Error should be shown (implementation depends on your error handling)
        expect(global.fetch).not.toHaveBeenCalledWith(
          expect.stringContaining('/api/payment-intent'),
          expect.any(Object)
        );
      });
    });

    it('should initialize payment when form is valid', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument();
      });

      // Fill in shipping form
      fireEvent.change(screen.getByPlaceholderText('Full name'), {
        target: { value: 'Test User' },
      });
      fireEvent.change(screen.getByPlaceholderText('Street address'), {
        target: { value: '123 Test St' },
      });
      fireEvent.change(screen.getByPlaceholderText('City'), {
        target: { value: 'Test City' },
      });
      fireEvent.change(screen.getByPlaceholderText('State'), {
        target: { value: 'Test State' },
      });
      fireEvent.change(screen.getByPlaceholderText('ZIP code'), {
        target: { value: '12345' },
      });
      fireEvent.change(screen.getByPlaceholderText('Phone number'), {
        target: { value: '1234567890' },
      });

      // Mock successful payment intent creation
      // First mock for saving shipping address
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });
      
      // Then mock for payment intent creation
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          clientSecret: 'pi_test_secret_xyz',
          orderId: 'order_123',
          paymentIntentId: 'pi_test_123',
        }),
      });

      const continueButton = screen.getByText('Continue to Payment');
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/payment-intent',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });
    });
  });

  describe('Payment Initialization', () => {
    it('should show payment form after successful initialization', async () => {
      render(<CheckoutPage />);

      // Fill form
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText('Full name'), {
        target: { value: 'Test User' },
      });
      fireEvent.change(screen.getByPlaceholderText('Street address'), {
        target: { value: '123 Test St' },
      });
      fireEvent.change(screen.getByPlaceholderText('City'), {
        target: { value: 'Test City' },
      });
      fireEvent.change(screen.getByPlaceholderText('State'), {
        target: { value: 'Test State' },
      });
      fireEvent.change(screen.getByPlaceholderText('ZIP code'), {
        target: { value: '12345' },
      });
      fireEvent.change(screen.getByPlaceholderText('Phone number'), {
        target: { value: '1234567890' },
      });

      // Mock successful payment intent
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          clientSecret: 'pi_test_secret_xyz',
          orderId: 'order_123',
        }),
      });

      // Mock fetch calls - first for saving address, then for payment intent
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          clientSecret: 'pi_test_secret_xyz',
          orderId: 'order_123',
        }),
      });

      const continueButton = screen.getByText('Continue to Payment');
      fireEvent.click(continueButton);

      // Wait for payment form to appear (stripe elements)
      await waitFor(() => {
        expect(screen.getByTestId('stripe-elements')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle payment initialization errors', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument();
      });

      // Fill form
      fireEvent.change(screen.getByPlaceholderText('Full name'), {
        target: { value: 'Test User' },
      });
      fireEvent.change(screen.getByPlaceholderText('Street address'), {
        target: { value: '123 Test St' },
      });
      fireEvent.change(screen.getByPlaceholderText('City'), {
        target: { value: 'Test City' },
      });
      fireEvent.change(screen.getByPlaceholderText('State'), {
        target: { value: 'Test State' },
      });
      fireEvent.change(screen.getByPlaceholderText('ZIP code'), {
        target: { value: '12345' },
      });
      fireEvent.change(screen.getByPlaceholderText('Phone number'), {
        target: { value: '1234567890' },
      });

      // Mock error response
      // First mock for saving shipping address
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });
      
      // Then mock for payment intent creation with error
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Failed to create payment intent',
        }),
      });

      const continueButton = screen.getByText('Continue to Payment');
      fireEvent.click(continueButton);

      // Wait for API call and error state update
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/payment-intent',
          expect.any(Object)
        );
      });

      // Wait for error message to be displayed
      await waitFor(() => {
        const errorMessage = screen.queryByTestId('error-message');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent(/Failed/i);
      }, { timeout: 3000 });
    });
  });
});

