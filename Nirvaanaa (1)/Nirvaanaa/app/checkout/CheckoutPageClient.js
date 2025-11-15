'use client';

import React, { useState, useEffect } from 'react';
import { useEnhancedCart } from '@/components/providers/EnhancedCartProvider';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FiPackage, FiTruck, FiCreditCard, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import Image from 'next/image';
import PaymentForm from '@/components/checkout/PaymentForm';

export default function CheckoutPageClient() {
  const { items } = useEnhancedCart();
  const { data: session } = useSession();
  const [razorpayOrderId, setRazorpayOrderId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [shipping, setShipping] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: '',
  });
  const [shippingMethod, setShippingMethod] = useState(null);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Fetch user profile, shipping address and shipping methods
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch shipping methods
        const shippingResponse = await fetch('/api/shipping');
        if (shippingResponse.ok) {
          const data = await shippingResponse.json();
          setShippingMethods(data.methods || []);
          // Set default shipping method
          const defaultMethod = (data.methods || []).find(m => m.isDefault) || (data.methods || [])[0];
          if (defaultMethod) {
            setShippingMethod(defaultMethod._id);
          }
        }

        // Fetch user profile if logged in
        if (session?.user?.email) {
          const userResponse = await fetch('/api/users/me');
          if (userResponse.ok) {
            const data = await userResponse.json();
            setUserProfile(data.user);
            
            // Pre-fill shipping address if available
            if (data.user.shippingAddress) {
              setShipping({
                name: data.user.shippingAddress.name || data.user.name || '',
                street: data.user.shippingAddress.street || '',
                city: data.user.shippingAddress.city || '',
                state: data.user.shippingAddress.state || '',
                zipCode: data.user.shippingAddress.zipCode || '',
                country: data.user.shippingAddress.country || 'India',
                phone: data.user.shippingAddress.phone || data.user.phone || '',
              });
            } else if (data.user.name) {
              // Use basic user info if no shipping address
              setShipping(prev => ({
                ...prev,
                name: data.user.name,
                phone: data.user.phone || '',
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [session]);

  const saveShippingAddress = async () => {
    if (session?.user?.email) {
      try {
        await fetch('/api/users/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shippingAddress: shipping
          }),
        });
      } catch (error) {
        console.error('Error saving shipping address:', error);
      }
    }
  };

  const initializePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Basic validation
      if (!shipping.name || !shipping.street || !shipping.city || !shipping.state || !shipping.zipCode) {
        setError('Please provide a complete shipping address');
        setLoading(false);
        return;
      }

      if (!shippingMethod) {
        setError('Please select a shipping method');
        setLoading(false);
        return;
      }

      // Save shipping address to user profile
      await saveShippingAddress();

      // Create Razorpay order
      const res = await fetch('/api/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shipping,
          shippingMethod: shippingMethods.find(m => m._id === shippingMethod)?.name || 'Standard Shipping',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      if (data.razorpayOrderId && data.amount) {
        setRazorpayOrderId(data.razorpayOrderId);
        setOrderId(data.orderId);
        setPaymentAmount(data.amount);
        setShowPaymentForm(true);
      } else {
        throw new Error('No payment order received');
      }
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError(err.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    if (!shippingMethod || !shippingMethods.length) return 0;
    
    const selectedMethod = shippingMethods.find(m => m._id === shippingMethod);
    if (!selectedMethod) return 0;
    
    // Return the cost, defaulting to 0 if cost is not defined
    // No free shipping thresholds - shipping cost is always applied
    return selectedMethod.cost || 0;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const shippingCost = calculateShipping();
    // Tax is calculated on subtotal + shipping cost (18% GST)
    return Math.round((subtotal + shippingCost) * 0.18);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-brown mb-4">Your cart is empty</h1>
          <p className="text-brand-brown mb-6">Add some items to your cart before checking out.</p>
          <a href="/products" className="btn-primary">
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-playfair font-bold text-brand-brown mb-8 text-center"
        >
          Secure Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            {!showPaymentForm && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-brand-brown flex items-center gap-2">
                      <FiTruck className="w-5 h-5" />
                      Shipping Address
                    </h2>
                    {userProfile?.shippingAddress && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <FiUser className="w-4 h-4" />
                        <span>From your saved address</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      className="input"
                      placeholder="Full name"
                      value={shipping.name}
                      onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                      required
                    />
                    <input
                      className="input"
                      placeholder="Phone number"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                      required
                    />
                    <input
                      className="input md:col-span-2"
                      placeholder="Street address"
                      value={shipping.street}
                      onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                      required
                    />
                    <input
                      className="input"
                      placeholder="City"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      required
                    />
                    <input
                      className="input"
                      placeholder="State"
                      value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                      required
                    />
                    <input
                      className="input"
                      placeholder="ZIP code"
                      value={shipping.zipCode}
                      onChange={(e) => setShipping({ ...shipping, zipCode: e.target.value })}
                      required
                    />
                    <input
                      className="input"
                      placeholder="Country"
                      value={shipping.country}
                      onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                      required
                    />
                  </div>
                </motion.div>

                {/* Shipping Method */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <h2 className="text-xl font-semibold text-brand-brown mb-6 flex items-center gap-2">
                    <FiPackage className="w-5 h-5" />
                    Shipping Method
                  </h2>
                  
                  <div className="space-y-4">
                    {shippingMethods.map((method) => (
                      <label key={method._id} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="shipping"
                          value={method._id}
                          checked={shippingMethod === method._id}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="w-4 h-4 text-brand-gold border-gray-300 focus:ring-brand-gold"
                        />
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-brand-brown">{method.name}</div>
                          <div className="text-sm text-gray-600">
                            {method.estimatedDays?.min}-{method.estimatedDays?.max} business days
                            {method.description && <div className="text-xs mt-1">{method.description}</div>}
                          </div>
                        </div>
                        <div className="font-semibold text-brand-brown">
                          {method.cost > 0 ? `₹${method.cost}` : 'Free'}
                        </div>
                      </label>
                    ))}
                  </div>
                </motion.div>
              </>
            )}

            {/* Payment Method Selection */}
            {!showPaymentForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold text-brand-brown mb-6 flex items-center gap-2">
                  <FiCreditCard className="w-5 h-5" />
                  Payment Method
                </h2>
                
                <div className="space-y-4">
                  <label className="block p-4 border-2 border-brand-gold rounded-lg bg-brand-gold/5 cursor-pointer hover:bg-brand-gold/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center border-2 border-brand-gold shadow-sm">
                          <FiCreditCard className="w-6 h-6 text-brand-gold" />
                        </div>
                        <div>
                          <div className="font-semibold text-brand-brown">Credit/Debit Card</div>
                          <div className="text-sm text-gray-600">Visa, Mastercard, RuPay, and more</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          defaultChecked
                          className="w-5 h-5 text-brand-gold border-gray-300 focus:ring-brand-gold cursor-pointer"
                          readOnly
                        />
                        <div className="flex items-center gap-1">
                          <FiLock className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-gray-600 font-medium">Secure</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-brand-gold/20">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FiLock className="w-3 h-3" />
                        <span>Your payment is secured by Razorpay. Card details are encrypted.</span>
                      </div>
                    </div>
                  </label>
                  
                  <label className="block p-4 border-2 border-brand-gold rounded-lg bg-brand-gold/5 cursor-pointer hover:bg-brand-gold/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center border-2 border-brand-gold shadow-sm">
                          <span className="text-2xl">📱</span>
                        </div>
                        <div>
                          <div className="font-semibold text-brand-brown">UPI Payment</div>
                          <div className="text-sm text-gray-600">Pay via UPI apps (PhonePe, Google Pay, etc.)</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          className="w-5 h-5 text-brand-gold border-gray-300 focus:ring-brand-gold cursor-pointer"
                          readOnly
                        />
                        <div className="flex items-center gap-1">
                          <FiLock className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-gray-600 font-medium">Secure</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-brand-gold/20">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FiLock className="w-3 h-3" />
                        <span>UPI payments are processed securely through Razorpay with QR code support.</span>
                      </div>
                    </div>
                  </label>
                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> All payments are processed securely through Razorpay. 
                      Test mode is enabled - no real charges will be made. Cards, UPI, wallets, and net banking are available.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Payment Form */}
            {showPaymentForm && razorpayOrderId && paymentAmount && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold text-brand-brown mb-6 flex items-center gap-2">
                  <FiCreditCard className="w-5 h-5" />
                  Payment Details
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Pay securely with cards, UPI, wallets, or net banking. Your payment is processed securely through Razorpay.
                </p>
                
                <PaymentForm 
                  razorpayOrderId={razorpayOrderId}
                  amount={paymentAmount}
                  orderId={orderId}
                  onSuccess={async (paymentResponse) => {
                    console.log('Payment succeeded:', paymentResponse);
                    setError(null);
                  }}
                  onError={(error) => {
                    console.error('Payment error:', error);
                    setError(error.message || 'Payment failed. Please try again.');
                  }}
                />
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2"
                role="alert"
                data-testid="error-message"
              >
                <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-brand-brown mb-6">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={`${item.name} - Handcrafted embroidery product in cart`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FiPackage className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-brand-brown text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      {item.colorVariant && (
                        <p className="text-xs text-gray-500">Color: {item.colorVariant.name}</p>
                      )}
                    </div>
                    <div className="font-semibold text-brand-brown text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-brand-brown">{formatPrice(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-brand-brown">
                    {calculateShipping() === 0 ? (
                      <span className="text-green-600 font-semibold">Free</span>
                    ) : (
                      formatPrice(calculateShipping())
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (GST 18%)</span>
                  <span className="text-brand-brown">{formatPrice(calculateTax())}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-3">
                  <span className="text-brand-brown">Total</span>
                  <span className="text-brand-brown font-bold">{formatPrice(calculateTotal())}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Total includes: Subtotal + Shipping + Tax
                </div>
              </div>

              {/* Continue to Payment Button */}
              {!showPaymentForm && (
                <button
                  onClick={initializePayment}
                  disabled={loading || items.length === 0}
                  className="w-full mt-6 bg-brand-gold text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiLock className="w-4 h-4" />
                      Continue to Payment
                    </>
                  )}
                </button>
              )}

              {/* Security Notice */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <FiLock className="w-3 h-3" />
                  Your payment information is secure and encrypted
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

