'use client';

import { createContext, useContext, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/lib/stores';
import { useSocket } from '@/lib/useSocket';
import { mutate } from 'swr';

const EnhancedCartContext = createContext();

export function EnhancedCartProvider({ children }) {
  const { data: session } = useSession();
  const { 
    items, 
    addItem, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    setItems,
    getTotal, 
    getCount,
    setLoading,
    setError 
  } = useCartStore();
  
  const { emitCartUpdate } = useSocket();

  // Load cart from server when user is authenticated
  useEffect(() => {
    if (session?.user?.email) {
      loadCartFromServer();
    }
  }, [session]);

  // Clear local cart when the user signs out
  useEffect(() => {
    if (!session) {
      // Only clear client-side cart; do not modify server-side persisted cart
      clearCart();
    }
  }, [session]);

  const loadCartFromServer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cart?email=${encodeURIComponent(session.user.email)}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error loading cart from server:', error);
      setError('Failed to load cart from server');
    } finally {
      setLoading(false);
    }
  };

  const syncCartWithServer = async (cartItems) => {
    if (!session?.user?.email) return;

    try {
      // Sync with server
      // Normalize client item shape -> server expected shape (productId)
      const itemsToSend = (cartItems || []).map(item => ({
        productId: item.productId || item.id || item._id,
        name: item.name,
        price: item.price,
        discount: item.discount || 0,
        image: item.image,
        quantity: item.quantity,
        slug: item.slug,
        colorVariant: item.colorVariant || null,
      }));

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: itemsToSend, 
          email: session.user.email 
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      // Emit real-time update
      emitCartUpdate(session.user.email, cartItems);

      // Revalidate SWR cache
      mutate(`/api/cart?email=${encodeURIComponent(session.user.email)}`);
    } catch (error) {
      console.error('Error syncing cart with server:', error);
      setError('Failed to sync cart with server');
      throw error; // Re-throw to be handled by the calling component
    }
  };

  const handleAddToCart = async (product, quantity = 1) => {
    try {
      addItem(product, quantity);
      
      if (session?.user?.email) {
        const updatedItems = useCartStore.getState().items;
        await syncCartWithServer(updatedItems);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error; // Re-throw to be handled by the calling component
    }
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      updateQuantity(productId, quantity);
      
      if (session?.user?.email) {
        const updatedItems = useCartStore.getState().items;
        await syncCartWithServer(updatedItems);
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw error; // Re-throw to be handled by the calling component
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
  // remove from local store
  removeItem(productId);
      
      if (session?.user?.email) {
        const updatedItems = useCartStore.getState().items;
        await syncCartWithServer(updatedItems);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error; // Re-throw to be handled by the calling component
    }
  };

  const handleClearCart = async () => {
    try {
      clearCart();
      
      if (session?.user?.email) {
        await syncCartWithServer([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error; // Re-throw to be handled by the calling component
    }
  };

  const value = {
    cart: items,
    items,
  addToCart: handleAddToCart,
  // backward-compatible alias for older components
  addItem: handleAddToCart,
    updateQuantity: handleUpdateQuantity,
  removeFromCart: handleRemoveFromCart,
  // alias: some components call removeItem directly
  removeItem: handleRemoveFromCart,
    clearCart: handleClearCart,
    getCartTotal: getTotal,
    getCartCount: getCount,
    isLoading: useCartStore.getState().isLoading,
    error: useCartStore.getState().error,
  };

  return (
    <EnhancedCartContext.Provider value={value}>
      {children}
    </EnhancedCartContext.Provider>
  );
}

export function useEnhancedCart() {
  const context = useContext(EnhancedCartContext);
  if (!context) {
    throw new Error('useEnhancedCart must be used within an EnhancedCartProvider');
  }
  return context;
}
