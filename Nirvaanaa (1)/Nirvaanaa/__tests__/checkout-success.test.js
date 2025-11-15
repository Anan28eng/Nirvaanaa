/**
 * Tests for Checkout Success Page
 * Tests payment verification and order display
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import CheckoutSuccessPage from '@/app/checkout/success/page';
import { loadStripe } from '@stripe/stripe-js';

jest.mock('next/navigation');
jest.mock('next-auth/react');
jest.mock('@stripe/stripe-js');

global.fetch = jest.fn();

describe('CheckoutSuccessPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
    useSearchParams.mockReturnValue(mockSearchParams);
    useSession.mockReturnValue({
      data: {
        user: {
          email: 'test@example.com',
        },
      },
    });
  });

  describe('Payment Verification', () => {
    it('should verify payment with Stripe when payment_intent is present', async () => {
      mockSearchParams.set('payment_intent', 'pi_test_123');
      mockSearchParams.set('payment_intent_client_secret', 'pi_test_123_secret');

      const mockStripe = {
        retrievePaymentIntent: jest.fn().mockResolvedValue({
          paymentIntent: {
            id: 'pi_test_123',
            status: 'succeeded',
          },
        }),
      };

      loadStripe.mockResolvedValue(mockStripe);

      // Mock order fetch
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          orders: [
            {
              _id: 'order_123',
              orderNumber: 'ORD-123',
              total: 2500,
              status: 'paid',
            },
          ],
        }),
      });

      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_test';

      render(<CheckoutSuccessPage />);

      await waitFor(() => {
        expect(mockStripe.retrievePaymentIntent).toHaveBeenCalledWith(
          'pi_test_123_secret'
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/Thank you for your order/i)).toBeInTheDocument();
      });
    });

    it('should handle payment verification errors gracefully', async () => {
      mockSearchParams.set('payment_intent', 'pi_test_123');
      mockSearchParams.set('payment_intent_client_secret', 'pi_test_123_secret');

      const mockStripe = {
        retrievePaymentIntent: jest.fn().mockRejectedValue(new Error('Network error')),
      };

      loadStripe.mockResolvedValue(mockStripe);

      render(<CheckoutSuccessPage />);

      await waitFor(() => {
        // Should still render something, even if verification fails
        expect(screen.queryByText(/Thank you for your order/i)).not.toBeInTheDocument();
      });
    });

    it('should show appropriate message for non-succeeded payment status', async () => {
      mockSearchParams.set('payment_intent', 'pi_test_123');
      mockSearchParams.set('payment_intent_client_secret', 'pi_test_123_secret');

      const mockStripe = {
        retrievePaymentIntent: jest.fn().mockResolvedValue({
          paymentIntent: {
            id: 'pi_test_123',
            status: 'processing',
          },
        }),
      };

      loadStripe.mockResolvedValue(mockStripe);

      render(<CheckoutSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText(/Payment processing/i)).toBeInTheDocument();
      });
    });
  });

  describe('Order Display', () => {
    it('should fetch and display order information', async () => {
      mockSearchParams.set('orderId', 'order_123');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          orders: [
            {
              _id: 'order_123',
              orderNumber: 'ORD-123',
              total: 2500,
              status: 'paid',
            },
          ],
        }),
      });

      render(<CheckoutSuccessPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/orders/user');
      });

      await waitFor(() => {
        expect(screen.getByText(/ORD-123/i)).toBeInTheDocument();
      });
    });

    it('should display download invoice button', async () => {
      mockSearchParams.set('orderId', 'order_123');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          orders: [
            {
              _id: 'order_123',
              orderNumber: 'ORD-123',
            },
          ],
        }),
      });

      render(<CheckoutSuccessPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Download Invoice/i })
        ).toBeInTheDocument();
      });
    });

    it('should handle invoice download', async () => {
      mockSearchParams.set('orderId', 'order_123');

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            orders: [
              {
                _id: 'order_123',
                orderNumber: 'ORD-123',
              },
            ],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          blob: async () => new Blob(['invoice content'], { type: 'application/pdf' }),
        });

      // Mock URL.createObjectURL and document.createElement
      global.URL.createObjectURL = jest.fn(() => 'blob:url');
      global.URL.revokeObjectURL = jest.fn();

      const mockClick = jest.fn();
      const mockAppendChild = jest.fn();
      const mockRemove = jest.fn();

      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
        remove: mockRemove,
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor);

      jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);

      render(<CheckoutSuccessPage />);

      await waitFor(() => {
        const downloadButton = screen.getByRole('button', {
          name: /Download Invoice/i,
        });
        downloadButton.click();
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/generate-invoice',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state while verifying payment', () => {
      mockSearchParams.set('payment_intent', 'pi_test_123');

      const mockStripe = {
        retrievePaymentIntent: jest.fn(
          () =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  paymentIntent: {
                    status: 'succeeded',
                  },
                });
              }, 1000);
            })
        ),
      };

      loadStripe.mockResolvedValue(mockStripe);

      render(<CheckoutSuccessPage />);

      expect(screen.getByText(/Verifying your payment/i)).toBeInTheDocument();
    });
  });
});

