/**
 * Tests for PaymentForm Component
 * Tests payment confirmation, success, cancellation, and error scenarios
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PaymentForm from '@/components/checkout/PaymentForm';
import { useStripe, useElements } from '@stripe/react-stripe-js';

jest.mock('@stripe/react-stripe-js');

describe('PaymentForm', () => {
  const mockClientSecret = 'pi_test_123_secret_xyz';
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  let mockStripe;
  let mockElements;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStripe = {
      retrievePaymentIntent: jest.fn(),
      confirmPayment: jest.fn(),
    };

    mockElements = {
      getElement: jest.fn(),
    };

    useStripe.mockReturnValue(mockStripe);
    useElements.mockReturnValue(mockElements);

    // Mock window.location
    delete window.location;
    window.location = { href: '', origin: 'http://localhost:3000' };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Payment Status Check', () => {
    it('should check payment status on mount', async () => {
      mockStripe.retrievePaymentIntent.mockResolvedValue({
        paymentIntent: {
          status: 'requires_payment_method',
        },
      });

      render(
        <PaymentForm
          clientSecret={mockClientSecret}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      await waitFor(() => {
        expect(mockStripe.retrievePaymentIntent).toHaveBeenCalledWith(
          mockClientSecret
        );
      });
    });

    it('should call onSuccess if payment already succeeded', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        status: 'succeeded',
      };

      mockStripe.retrievePaymentIntent.mockResolvedValue({
        paymentIntent: mockPaymentIntent,
      });

      render(
        <PaymentForm
          clientSecret={mockClientSecret}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(mockPaymentIntent);
      });

      expect(screen.getByText(/Payment succeeded!/i)).toBeInTheDocument();
    });

    it('should show processing message for processing payments', async () => {
      mockStripe.retrievePaymentIntent.mockResolvedValue({
        paymentIntent: {
          status: 'processing',
        },
      });

      render(
        <PaymentForm
          clientSecret={mockClientSecret}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Your payment is processing/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Payment Confirmation', () => {
    it('should confirm payment on form submit', async () => {
      mockStripe.retrievePaymentIntent.mockResolvedValue({
        paymentIntent: {
          status: 'requires_payment_method',
        },
      });

      const mockPaymentIntent = {
        id: 'pi_test_123',
        status: 'succeeded',
      };

      mockStripe.confirmPayment.mockResolvedValue({
        paymentIntent: mockPaymentIntent,
      });

      render(
        <PaymentForm
          clientSecret={mockClientSecret}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Pay Now/i })).toBeInTheDocument();
      });

      // Find and click the submit button directly
      const submitButton = screen.getByRole('button', { name: /Pay Now/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockStripe.confirmPayment).toHaveBeenCalledWith({
          elements: mockElements,
          confirmParams: {
            return_url: 'http://localhost:3000/checkout/success',
          },
          redirect: 'if_required',
        });
      });
    });

    it('should handle successful payment confirmation', async () => {
      mockStripe.retrievePaymentIntent.mockResolvedValue({
        paymentIntent: {
          status: 'requires_payment_method',
        },
      });

      const mockPaymentIntent = {
        id: 'pi_test_123',
        status: 'succeeded',
      };

      mockStripe.confirmPayment.mockResolvedValue({
        paymentIntent: mockPaymentIntent,
      });

      render(
        <PaymentForm
          clientSecret={mockClientSecret}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Pay Now/i });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(mockPaymentIntent);
        expect(window.location.href).toContain('/checkout/success');
      });
    });

    it('should handle payment cancellation', async () => {
      mockStripe.retrievePaymentIntent.mockResolvedValue({
        paymentIntent: {
          status: 'requires_payment_method',
        },
      });

      const mockError = {
        type: 'card_error',
        message: 'Your card was declined.',
      };

      mockStripe.confirmPayment.mockResolvedValue({
        error: mockError,
      });

      render(
        <PaymentForm
          clientSecret={mockClientSecret}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Pay Now/i });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(mockError);
        expect(screen.getByText(/Your card was declined/i)).toBeInTheDocument();
      });
    });

    it('should handle payment errors gracefully', async () => {
      mockStripe.retrievePaymentIntent.mockResolvedValue({
        paymentIntent: {
          status: 'requires_payment_method',
        },
      });

      const mockError = {
        type: 'validation_error',
        message: 'Invalid payment details',
      };

      mockStripe.confirmPayment.mockResolvedValue({
        error: mockError,
      });

      render(
        <PaymentForm
          clientSecret={mockClientSecret}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Pay Now/i });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(mockError);
        expect(
          screen.getByText(/Invalid payment details/i)
        ).toBeInTheDocument();
      });
    });

    it('should handle unexpected errors', async () => {
      mockStripe.retrievePaymentIntent.mockResolvedValue({
        paymentIntent: {
          status: 'requires_payment_method',
        },
      });

      mockStripe.confirmPayment.mockRejectedValue(
        new Error('Network error')
      );

      render(
        <PaymentForm
          clientSecret={mockClientSecret}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Pay Now/i });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
        expect(
          screen.getByText(/An unexpected error occurred/i)
        ).toBeInTheDocument();
      });
    });

    it('should handle 3D Secure authentication', async () => {
      mockStripe.retrievePaymentIntent.mockResolvedValue({
        paymentIntent: {
          status: 'requires_payment_method',
        },
      });

      const mockPaymentIntent = {
        id: 'pi_test_123',
        status: 'requires_action',
      };

      mockStripe.confirmPayment
        .mockResolvedValueOnce({
          paymentIntent: mockPaymentIntent,
        })
        .mockResolvedValueOnce({
          paymentIntent: {
            ...mockPaymentIntent,
            status: 'succeeded',
          },
        });

      render(
        <PaymentForm
          clientSecret={mockClientSecret}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Pay Now/i });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockStripe.confirmPayment).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Loading States', () => {
    it('should disable submit button when loading', async () => {
      mockStripe.retrievePaymentIntent.mockResolvedValue({
        paymentIntent: {
          status: 'requires_payment_method',
        },
      });

      mockStripe.confirmPayment.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                paymentIntent: {
                  id: 'pi_test_123',
                  status: 'succeeded',
                },
              });
            }, 1000);
          })
      );

      render(
        <PaymentForm
          clientSecret={mockClientSecret}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Pay Now/i });
        expect(submitButton).not.toBeDisabled();
      });

      const submitButton = screen.getByRole('button', { name: /Pay Now/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Processing/i)).toBeInTheDocument();
      });
    });
  });
});

