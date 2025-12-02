'use client';

import { useCallback, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { useCartStore } from './stores';
import { useWishlistStore } from './stores';
import { useAdminStore } from './stores';
import { useRealtimeStore } from './stores';

export const useSocket = () => {
  const { data: session } = useSession();
  const socketRef = useRef(null);
  const { setSocket, setConnected, setReconnectAttempts, reconnectAttempts, maxReconnectAttempts } = useRealtimeStore();
  
  // Store actions
  const { setItems: setCartItems } = useCartStore();
  const { setItems: setWishlistItems } = useWishlistStore();
  const { 
    addProduct, 
    updateProduct, 
    removeProduct, 
    addOrder, 
    updateOrder, 
    removeOrder, 
    addCustomer, 
    updateCustomer, 
    removeCustomer,
    addKpi,
    updateKpi,
    removeKpi,
    setAnalytics
  } = useAdminStore();

  const initializeSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Prevent initializing sockets in production if disabled
    if (process.env.DISABLE_SOCKET === 'true' || process.env.NODE_ENV === 'production') {
      console.warn('[useSocket] socket disabled in this environment');
      return () => {};
    }

    // Determine origin for socket connection. In client-side runtime prefer NEXT_PUBLIC_API_URL or window origin.
    const origin = (typeof window !== 'undefined' && window.location && window.location.origin)
      ? window.location.origin
      : process.env.NEXT_PUBLIC_API_URL || process.env.NEXTAUTH_URL || 'https://nirvaanaa.in';

    // Initialize socket connection
    const socket = io(origin, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;
    setSocket(socket);

    const handleConnect = () => {
      console.log('Connected to WebSocket server');
      setConnected(true);
      setReconnectAttempts(0);

      if (session?.user?.email) {
        socket.emit('join-user', session.user.email);
      }

      if (session?.user?.role === 'admin') {
        socket.emit('join-admin');
      }
    };

    const handleDisconnect = () => {
      console.log('Disconnected from WebSocket server');
      setConnected(false);
    };

    const handleConnectError = (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
    };

    const handleReconnectAttempt = (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
      setReconnectAttempts(attemptNumber);
    };

    const handleCartChanged = (data) => {
      console.log('Cart updated via WebSocket:', data);
      if (data.items) {
        setCartItems(data.items);
      }
    };

    const handleWishlistChanged = (data) => {
      console.log('Wishlist updated via WebSocket:', data);
      if (data.items) {
        setWishlistItems(data.items);
      }
    };

    const handleProductChanged = (data) => {
      console.log('Product updated via WebSocket:', data);
      switch (data.action) {
        case 'created':
          addProduct(data.product);
          break;
        case 'updated':
          updateProduct(data.product._id, data.product);
          break;
        case 'deleted':
          removeProduct(data.productId);
          break;
      }
    };

    const handleOrderChanged = (data) => {
      console.log('Order updated via WebSocket:', data);
      switch (data.action) {
        case 'created':
          addOrder(data.order);
          break;
        case 'updated':
          updateOrder(data.order._id, data.order);
          break;
        case 'deleted':
          removeOrder(data.orderId);
          break;
      }
    };

    const handleCustomerChanged = (data) => {
      console.log('Customer updated via WebSocket:', data);
      switch (data.action) {
        case 'created':
          addCustomer(data.customer);
          break;
        case 'updated':
          updateCustomer(data.customer._id, data.customer);
          break;
        case 'deleted':
          removeCustomer(data.customerId);
          break;
      }
    };

    const handleKpiChanged = (data) => {
      console.log('KPI updated via WebSocket:', data);
      switch (data.action) {
        case 'created':
          addKpi(data.kpi);
          break;
        case 'updated':
          updateKpi(data.kpi._id, data.kpi);
          break;
        case 'deleted':
          removeKpi(data.kpiId);
          break;
      }
    };

    const handleAnalyticsUpdated = (data) => {
      console.log('Analytics updated via WebSocket:', data);
      setAnalytics(data.analytics);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('reconnect_attempt', handleReconnectAttempt);
    socket.on('cart-changed', handleCartChanged);
    socket.on('wishlist-changed', handleWishlistChanged);
    socket.on('product-changed', handleProductChanged);
    socket.on('order-changed', handleOrderChanged);
    socket.on('customer-changed', handleCustomerChanged);
    socket.on('kpi-changed', handleKpiChanged);
    socket.on('analytics-updated', handleAnalyticsUpdated);

    // Connect to socket
    socket.connect();

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('reconnect_attempt', handleReconnectAttempt);
      socket.off('cart-changed', handleCartChanged);
      socket.off('wishlist-changed', handleWishlistChanged);
      socket.off('product-changed', handleProductChanged);
      socket.off('order-changed', handleOrderChanged);
      socket.off('customer-changed', handleCustomerChanged);
      socket.off('kpi-changed', handleKpiChanged);
      socket.off('analytics-updated', handleAnalyticsUpdated);

      socket.disconnect();
    };
  }, [
    session,
    maxReconnectAttempts,
    setSocket,
    setConnected,
    setReconnectAttempts,
    setCartItems,
    setWishlistItems,
    addProduct,
    updateProduct,
    removeProduct,
    addOrder,
    updateOrder,
    removeOrder,
    addCustomer,
    updateCustomer,
    removeCustomer,
    addKpi,
    updateKpi,
    removeKpi,
    setAnalytics,
  ]);

  useEffect(() => {
    const cleanup = initializeSocket();
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [initializeSocket]);

  // Update room membership when session changes
  useEffect(() => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      if (session?.user?.email) {
        socket.emit('join-user', session.user.email);
      }
      if (session?.user?.role === 'admin') {
        socket.emit('join-admin');
      }
    }
  }, [session]);

  // Emit functions for client-side updates
  const emitCartUpdate = (userId, items) => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit('cart-updated', { userId, items });
    }
  };

  const emitWishlistUpdate = (userId, items) => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit('wishlist-updated', { userId, items });
    }
  };

  const emitProductUpdate = (action, product) => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit('product-updated', { action, product });
    }
  };

  const emitKpiUpdate = (action, kpi) => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit('kpi-updated', { action, kpi });
    }
  };

  return {
    socket: socketRef.current,
    emitCartUpdate,
    emitWishlistUpdate,
    emitProductUpdate,
    emitKpiUpdate,
  };
};
