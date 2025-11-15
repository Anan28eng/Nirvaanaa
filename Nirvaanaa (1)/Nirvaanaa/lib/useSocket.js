'use client';

import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    // Initialize socket connection
    const socket = io(process.env.NEXTAUTH_URL || 'http://localhost:3000', {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;
    setSocket(socket);

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setConnected(true);
      setReconnectAttempts(0);

      // Join user-specific room if authenticated
      if (session?.user?.email) {
        socket.emit('join-user', session.user.email);
      }

      // Join admin room if user is admin
      if (session?.user?.role === 'admin') {
        socket.emit('join-admin');
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
      setReconnectAttempts(attemptNumber);
    });

    // Cart events
    socket.on('cart-changed', (data) => {
      console.log('Cart updated via WebSocket:', data);
      if (data.items) {
        setCartItems(data.items);
      }
    });

    // Wishlist events
    socket.on('wishlist-changed', (data) => {
      console.log('Wishlist updated via WebSocket:', data);
      if (data.items) {
        setWishlistItems(data.items);
      }
    });

    // Admin events
    socket.on('product-changed', (data) => {
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
    });

    socket.on('order-changed', (data) => {
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
    });

    socket.on('customer-changed', (data) => {
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
    });

    socket.on('kpi-changed', (data) => {
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
    });

    socket.on('analytics-updated', (data) => {
      console.log('Analytics updated via WebSocket:', data);
      setAnalytics(data.analytics);
    });

    // Connect to socket
    socket.connect();

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [session]);

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
