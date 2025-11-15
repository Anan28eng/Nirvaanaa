'use client';

import { createContext, useContext, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useWishlistStore } from '@/lib/stores';
import { useSocket } from '@/lib/useSocket';
import { mutate } from 'swr';

const EnhancedWishlistContext = createContext();

export function EnhancedWishlistProvider({ children }) {
  const { data: session } = useSession();
  const { 
    items, 
    addItem, 
    removeItem, 
    clearWishlist, 
    setItems,
    getCount,
    hasItem,
    setLoading,
    setError 
  } = useWishlistStore();
  
  const { emitWishlistUpdate } = useSocket();

  // Load wishlist from server when user is authenticated
  useEffect(() => {
    if (session?.user?.email) {
      loadWishlistFromServer();
    }
  }, [session]);

  const loadWishlistFromServer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/wishlist?email=${encodeURIComponent(session.user.email)}`);
      if (response.ok) {
        const data = await response.json();
        // Normalize server wishlist shape (productId) -> client store shape (id)
        const normalized = (data.wishlist || []).map(i => ({
          id: i.productId || i.id,
          productId: i.productId || i.id,
          name: i.name,
      price: i.price,
      discount: i.discount || 0,
          image: i.image,
          slug: i.slug,
          addedAt: i.addedAt,
        }));
        setItems(normalized);
      }
    } catch (error) {
      console.error('Error loading wishlist from server:', error);
      setError('Failed to load wishlist from server');
    } finally {
      setLoading(false);
    }
  };

  const syncWishlistWithServer = async (wishlistItems) => {
    if (!session?.user?.email) return;

    try {
      // Sync with server
      // Convert client items (id) -> server expected shape (productId)
      const serverItems = (wishlistItems || []).map(it => ({
        productId: it.id || it.productId,
        name: it.name,
  price: it.price,
  discount: it.discount || 0,
        image: it.image,
        slug: it.slug,
        addedAt: it.addedAt,
      }));

      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: serverItems, 
          email: session.user.email 
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      // Emit real-time update
      emitWishlistUpdate(session.user.email, wishlistItems);

      // Revalidate SWR cache
      mutate(`/api/wishlist?email=${encodeURIComponent(session.user.email)}`);
    } catch (error) {
      console.error('Error syncing wishlist with server:', error);
      setError('Failed to sync wishlist with server');
      throw error; // Re-throw to be handled by the calling component
    }
  };

  const handleAddToWishlist = async (product) => {
    try {
      const pid = product.id || product._id || product.productId;
      if (!hasItem(pid)) {
        const normalized = {
          id: pid,
          name: product.name || product.title,
          price: product.price,
          image: product.image || product.mainImage,
          slug: product.slug,
          addedAt: new Date().toISOString(),
        };
        addItem(normalized);
        
        if (session?.user?.email) {
          const updatedItems = useWishlistStore.getState().items;
          await syncWishlistWithServer(updatedItems);
        }
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error; // Re-throw to be handled by the calling component
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      removeItem(productId);
      
      if (session?.user?.email) {
        const updatedItems = useWishlistStore.getState().items;
        await syncWishlistWithServer(updatedItems);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error; // Re-throw to be handled by the calling component
    }
  };

  const handleClearWishlist = async () => {
    try {
      clearWishlist();
      
      if (session?.user?.email) {
        await syncWishlistWithServer([]);
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      throw error; // Re-throw to be handled by the calling component
    }
  };

  const value = {
    wishlist: items,
    items,
  addToWishlist: handleAddToWishlist,
  // backward-compatible alias
  addItem: handleAddToWishlist,
    removeFromWishlist: handleRemoveFromWishlist,
    clearWishlist: handleClearWishlist,
    getWishlistCount: getCount,
    hasItem,
    isLoading: useWishlistStore.getState().isLoading,
    error: useWishlistStore.getState().error,
  };

  return (
    <EnhancedWishlistContext.Provider value={value}>
      {children}
    </EnhancedWishlistContext.Provider>
  );
}

export function useEnhancedWishlist() {
  const context = useContext(EnhancedWishlistContext);
  if (!context) {
    throw new Error('useEnhancedWishlist must be used within an EnhancedWishlistProvider');
  }
  return context;
}
